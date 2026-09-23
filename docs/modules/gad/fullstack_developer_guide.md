# 💻 GAD Module: Fullstack Developer Guide

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Gender and Development (GAD) Module

---

## 🌐 1. HTTP Route & Controller Matrix

All GAD routes are prefixed under `/admin/gad-events` and protected by `auth` and `role:admin,head` middleware.

| HTTP Method | Route URI | Action / Method | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/gad-events` | `GadEventController@index` | Lists all events with search, status tabs, and calendar data. |
| `POST` | `/admin/gad-events` | `GadEventController@store` | Creates a new GAD event; handles banner image upload. |
| `PUT` | `/admin/gad-events/{id}` | `GadEventController@update` | Updates event title, description, time, venue, or banner. |
| `POST` | `/admin/gad-events/{id}/status` | `GadEventController@updateStatus` | Updates status (`approved`, `rejected`, `reschedule_requested`). |
| `DELETE` | `/admin/gad-events/{id}` | `GadEventController@destroy` | Deletes an event and cleans up stored image assets. |

---

## ⚡ 2. Backend Controller Implementation

### 2.1 Handling Event Approval & Queue Dispatch
```php
// app/Http/Controllers/Admin/GadEventController.php
public function updateStatus(Request $request, $id)
{
    $event = GadEvent::findOrFail($id);

    $validated = $request->validate([
        'status'        => 'required|in:approved,rejected,reschedule_requested',
        'reject_reason' => 'required_if:status,rejected,reschedule_requested|nullable|string|max:1000',
    ]);

    $oldStatus = $event->status;
    $event->status = $validated['status'];
    $event->reject_reason = $validated['reject_reason'] ?? null;
    $event->save();

    // Trigger asynchronous broadcast if transitioning to approved
    if ($oldStatus !== 'approved' && $event->status === 'approved') {
        SendBulkGadEventEmail::dispatch($event);
    }

    return redirect()->back()->with('success', 'Event status updated successfully.');
}
```

---

## ⚛️ 3. Frontend Architecture (`Index.tsx`)

```typescript
// Status Action Modal Handler
const handleStatusSubmit = () => {
    if (!actionEvent || !actionType) return;
    
    router.post(`/admin/gad-events/${actionEvent.id}/status`, {
        status: actionType,
        reject_reason: rejectReason,
    }, {
        onSuccess: () => {
            setStatusModal(false);
            setRejectReason('');
            setActionEvent(null);
            setActionType(null);
        },
    });
};
```

---

## 🧪 4. Testing Suite (PHPUnit)

```php
public function test_approving_event_dispatches_bulk_email_job()
{
    Queue::fake();

    $event = GadEvent::factory()->create(['status' => 'pending']);

    $response = $this->actingAs($this->adminUser)
        ->post("/admin/gad-events/{$event->id}/status", [
            'status' => 'approved',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('gad_events', [
        'id'     => $event->id,
        'status' => 'approved',
    ]);

    Queue::assertPushed(SendBulkGadEventEmail::class, function ($job) use ($event) {
        return $job->event->id === $event->id;
    });
}
```

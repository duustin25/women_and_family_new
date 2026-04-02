<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Announcement extends Model
{
    protected $fillable = [
        'user_id',
        'organization_id',
        'title',
        'slug',
        'category',
        'content',
        'excerpt',
        'image_path',
        'location',
        'event_date'
    ];

    /**
     * RELATIONSHIP: Announcement belongs to an organization (for targeted messaging)
     */
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    // SOLID: Encapsulation - Model handles its own data types
    protected $casts = [
        'event_date' => 'date',
        'created_at' => 'datetime',
    ];

    // Automatically generate slug when title is set
    protected static function boot()
    {
        parent::boot();
        static::creating(fn($model) => $model->slug = Str::slug($model->title));
    }

    // Design Principle: Accessor for consistent Image URLs
    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->image_path
                ? asset('storage/' . $this->image_path)
                : asset('images/placeholder.jpg'),
        );
    }

    /**
     * Get the route key for the model.
     * This allows Laravel to resolve /announcements/my-title-slug
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }
}

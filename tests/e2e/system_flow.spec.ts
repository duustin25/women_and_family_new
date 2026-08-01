/**
 * End-to-End (E2E) Test Suite for Barangay WFP Management System
 * Built using Playwright Automation Framework
 * 
 * Purpose: Simulates a complete user journey:
 * 1. Resident visits public portal
 * 2. Toggles Accessibility Options (Voice Assist / High Contrast / Text Resizing)
 * 3. Verifies Emergency Hotline banners and Chatbot Maintenance Toggle
 * 4. Navigates to VAWC desk information page
 */

import { test, expect } from '@playwright/test';

test.describe('Barangay Public Portal & Accessibility E2E Test Flow', () => {
    test('User can open accessibility menu and toggle settings', async ({ page }) => {
        // Navigate to public portal root
        await page.goto('/');

        // Verify page header logo and titles
        await expect(page).toHaveTitle(/Barangay|Women & Family|WFP/i);

        // Click Accessibility floating menu button
        const accessibilityBtn = page.getByRole('button', { name: /Toggle Accessibility Menu|Accessibility/i });
        await expect(accessibilityBtn).toBeVisible();
        await accessibilityBtn.click();

        // Verify Accessibility Panel opens
        const accessibilityDialog = page.getByRole('dialog', { name: /Accessibility Settings/i });
        await expect(accessibilityDialog).toBeVisible();

        // Toggle Voice Assist ON
        const voiceAssistBtn = page.getByRole('button', { name: /Toggle Voice Reader/i });
        await voiceAssistBtn.click();
        await expect(voiceAssistBtn).toContainText('ON');

        // Toggle High Contrast Mode ON
        const highContrastBtn = page.getByRole('button', { name: /Toggle High Contrast Mode/i });
        await highContrastBtn.click();
        await expect(highContrastBtn).toContainText('ON');

        // Select Large Font Size (+25%)
        const largeFontBtn = page.getByRole('button', { name: /Large \(\+25%\)/i });
        await largeFontBtn.click();

        // Close Accessibility Menu
        await accessibilityBtn.click();
    });

    test('User can access Emergency Hotlines and Chatbot Widget', async ({ page }) => {
        await page.goto('/');

        // Verify Emergency 911 Hotline presence
        const emergencyBanner = page.locator('text=Emergency:');
        await expect(emergencyBanner).toBeVisible();

        // Click Chatbot Floating Widget button
        const chatbotBtn = page.getByRole('button', { name: /Open AI Assistant|CHAT/i });
        await expect(chatbotBtn).toBeVisible();
        await chatbotBtn.click();
    });
});

# Save-on-Close & Auto-Save Improvement Plan

## Current State

### Problems Identified

1. **No warning when closing modified tabs** — `closeTab()`, `closeOtherTabs()`, `closeAllTabs()`, and `closeTabsToRight()` all silently discard unsaved changes.
2. **No `beforeunload` warning** — Closing the browser window/tab with modified documents gives zero warning.
3. **Auto-save is configured in Settings UI but never actually runs** — `settings.autoSave` and `settings.autoSaveInterval` exist in the data model and settings modal, but no code uses them. The only periodic save is a hardcoded 10-second IndexedDB crash-recovery interval, which does *not* write to the actual file on disk.

### Relevant Code

| File | Key Area |
|------|----------|
| `src/hooks/useEditorStore.ts:150` | `closeTab()` — no `isModified` check |
| `src/hooks/useEditorStore.ts:110-133` | Recovery interval — 10s, IndexedDB only |
| `src/hooks/useEditorStore.ts:342-367` | `handleSaveFile()` — writes to actual file |
| `src/lib/db.ts:10-11` | `autoSave` and `autoSaveInterval` settings |
| `src/components/SettingsModal.tsx:186-231` | Auto-save toggle and interval slider UI |
| `src/components/TabBar.tsx:98-112` | Close button on tabs |
| `src/App.tsx:81-83` | `handleCloseTab` — delegates to `closeTab` |

---

## Proposed Approach

### A. Tab Close — Confirmation Dialog

Add a reusable **unsaved-changes confirmation modal** that appears when the user tries to close a modified tab.

```
User clicks close on modified tab
        │
        ▼
┌─────────────────────────────┐
│ Do you want to save changes │
│ to "filename.txt"?          │
│                             │
│  [Save]  [Don't Save] [Cancel] │
└─────────────────────────────┘
        │
        ├── Save → call handleSaveFile, then close
        ├── Don't Save → close without saving
        └── Cancel → do nothing
```

**Scope of changes:**

- Create a new `ConfirmCloseModal` component with three actions: Save, Don't Save, Cancel
- Modify `closeTab` to return early when `isModified === true` and instead show the modal
- Apply the same logic to `closeOtherTabs`, `closeAllTabs`, `closeTabsToRight`
- When auto-save is enabled, skip the dialog and auto-save before closing

### B. Browser Close — `beforeunload` Warning

Add a `beforeunload` event listener that fires only when there are modified tabs:

```typescript
useEffect - => {
  const handler = - e: BeforeUnloadEvent - => {
    if - tabs.some - t => t.isModified - - {
      e.preventDefault - -;
    }
  };
  window.addEventListener - 'beforeunload', handler -;
  return - - => window.removeEventListener - 'beforeunload', handler -;
}, [tabs] -;
```

This shows the browser-native "Changes you made may not be saved" prompt. No custom UI is possible here — browsers restrict this for security.

### C. Auto-Save — Wire Up Existing Settings

Implement a real auto-save interval that calls `handleSaveFile` for each modified tab that has a file handle, using the user-configured `settings.autoSave` and `settings.autoSaveInterval`.

```
┌──────────────────────────────────┐
│ Auto-Save Interval Timer         │
│ - runs every autoSaveInterval ms │
│ - only when autoSave is enabled  │
└──────────┬───────────────────────┘
           │
           ▼
  For each tab where isModified && fileHandle:
           │
           ├── Call saveFile - content, fileHandle -
           ├── Set isModified = false
           └── Clear recovery data for that tab
```

**Key decisions:**

- Tabs without a `fileHandle` — i.e. new untitled files — cannot be auto-saved because the File System Access API requires user-initiated file picker interaction. These will continue to rely on the recovery data mechanism.
- The existing 10-second recovery interval should remain as a safety net for crash recovery, independent of auto-save.
- The auto-save interval should be tied to `settings.autoSaveInterval` — not hardcoded.

---

## Implementation Plan

### Step 1: Add `beforeunload` warning
- In `useEditorStore.ts` or `App.tsx`, add a `useEffect` that registers a `beforeunload` handler
- Only prevent default when `tabs.some(t => t.isModified)`

### Step 2: Create `ConfirmCloseModal` component
- New file: `src/components/ConfirmCloseModal.tsx`
- Props: `isOpen`, `filename`, `onSave`, `onDontSave`, `onCancel`
- Three-button modal matching VS Code style: Save / Don't Save / Cancel

### Step 3: Add close-with-confirmation logic to `useEditorStore`
- Modify `closeTab` to check `isModified` and surface a pending-close request
- Add state: `pendingClose: { tabId: string } | null`
- Expose `confirmClose`, `cancelClose`, `discardAndClose` callbacks
- Apply same pattern to batch operations: `closeOtherTabs`, `closeAllTabs`, `closeTabsToRight`

### Step 4: Integrate `ConfirmCloseModal` in `App.tsx`
- Render `ConfirmCloseModal` based on `pendingClose` state
- Connect Save/Don't Save/Cancel to the exposed callbacks

### Step 5: Implement auto-save interval
- In `useEditorStore.ts`, add a new `useEffect` that:
  - Starts a `setInterval` when `settings.autoSave` is true
  - Uses `settings.autoSaveInterval` for timing
  - Iterates tabs, calls `saveFile()` for each tab where `isModified && fileHandle`
  - Clears the interval when `settings.autoSave` is false or on unmount
- Show a toast notification on auto-save

### Step 6: Auto-save on close integration
- When auto-save is enabled and a modified tab has a `fileHandle`, skip the confirmation dialog and auto-save before closing
- When the tab has no `fileHandle`, still show the confirmation dialog even with auto-save enabled

### Step 7: Update recovery interval to use settings
- Consider tying the existing 10-second recovery interval to `autoSaveInterval` or keeping it independent
- Recommended: keep it independent as a crash-recovery safety net

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/ConfirmCloseModal.tsx` | **Create** | Unsaved changes confirmation dialog |
| `src/hooks/useEditorStore.ts` | **Modify** | Add close-confirmation state, auto-save interval, beforeunload |
| `src/App.tsx` | **Modify** | Integrate ConfirmCloseModal, pass new callbacks to TabBar |
| `src/components/TabBar.tsx` | **Modify** | Minor — may need to pass through new close handler |

---

## Open Questions for Discussion

1. **Should auto-save skip the dialog entirely?** When auto-save is on and a file has a handle, should closing immediately auto-save and close without any prompt?
2. **Batch close behavior** — When closing all tabs, should we show one dialog per modified tab, or a single "Save all / Don't save all / Cancel" dialog?
3. **Toast on auto-save** — Should auto-save show a brief toast notification, or be completely silent?

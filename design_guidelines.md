# Design Guidelines: Recommendation Vault

## 1. Brand Identity

**Purpose**: A personal curator's notebook that makes capturing and sharing media recommendations effortless.

**Aesthetic Direction**: **Editorial/Magazine**
- Clean, content-first layouts with breathing room
- Typographic hierarchy emphasizes the content itself (book titles, movie names)
- Sophisticated but approachable
- Minimal chrome, maximum readability

**Memorable Element**: Lightning-fast capture flow. The floating "+" button triggers an intelligent bottom sheet that processes photos with on-device OCR in real-time, showing the extracted title as it types itself out.

---

## 2. Navigation Architecture

**Root Navigation**: Floating Action Button + 2 Tabs

**Tab Structure**:
- **Library** (default) - Browse all saved recommendations
- **Categories** - Organized view by content type (Books, Movies, Music, etc.)
- **Floating "+" Button** - Core capture action (positioned center-bottom)

**Navigation Stacks**:
- **Library Stack**: Library → Detail View → Edit
- **Categories Stack**: Categories → Category List → Detail View
- **Modal Flows**: Add Recommendation (full-screen modal), Settings (modal)

---

## 3. Screen-by-Screen Specifications

### 3.1 Library Screen (Default Tab)
**Purpose**: Browse and search all saved recommendations

**Layout**:
- Header: Transparent, left button = Settings gear icon, right button = Search icon
- Main content: Scrollable vertical list of recommendation cards
- Safe area: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
- Search bar (hidden by default, slides down when search icon tapped)
- Recommendation cards with:
  - Title (bold, large)
  - Category badge (Books, Movies, etc.)
  - Optional thumbnail/cover image
  - Optional note preview (1 line, truncated)
  - Timestamp ("Added 3d ago")
- Empty state: "empty-library.png" illustration with text "No recommendations yet\nTap + to save your first"

**Interactions**:
- Tap card → Detail View
- Pull to refresh (updates timestamps)
- Long press → Quick Actions (Share, Delete)

---

### 3.2 Categories Screen (Tab 2)
**Purpose**: View recommendations organized by content type

**Layout**:
- Header: Transparent, title = "Categories"
- Main content: Scrollable grid of category tiles (2 columns)
- Safe area: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
- Category tiles with:
  - System icon (book.fill, film.fill, music.note, etc.)
  - Category name
  - Count badge ("12 saved")
- Empty state: "empty-categories.png" if no items exist

**Interactions**:
- Tap tile → Category List screen (shows all items in that category)

---

### 3.3 Add Recommendation Modal (Floating Button)
**Purpose**: Capture a recommendation via manual input or photo

**Layout**:
- Full-screen modal with close button (top-left X)
- Bottom sheet style with rounded top corners
- Safe area: top = insets.top + Spacing.xl, bottom = insets.bottom + Spacing.xl

**Components**:
- Two large option buttons at top:
  - "Scan Image" (camera icon) - Opens camera/photo picker
  - "Enter Manually" (keyboard icon) - Shows input form
- If photo selected:
  - Shows thumbnail
  - Real-time OCR text extraction (typewriter effect)
  - AI suggestions: Detected title, category, platform
  - "Use this" button to accept
- Manual form fields:
  - Title (required)
  - Category picker (Books, Movies, TV, Music, Podcasts, Other)
  - Platform URL (optional, with smart suggestions)
  - Notes (optional, multi-line)
  - Submit button in header (Save)

**Interactions**:
- Camera → OCR processing → Auto-fill form
- Manual → Direct to form input
- Save creates local entry and dismisses modal

---

### 3.4 Detail View Screen
**Purpose**: View full recommendation details and share

**Layout**:
- Header: Non-transparent, left = Back, right = Edit icon
- Main content: Scrollable form-like layout
- Floating share button (bottom-right corner with drop shadow)
- Safe area: top = Spacing.xl, bottom = insets.bottom + Spacing.xl + 80 (space for floating button)

**Components**:
- Large title
- Category badge
- Platform link (tappable, opens in browser/app)
- Notes section (full text)
- Metadata: Added date, last modified
- Floating circular share button (system share icon)

**Interactions**:
- Edit icon → Edit mode (same form as Add, pre-filled)
- Share button → Native share sheet with title + link + optional image
- Platform link → Deep link or web fallback

---

### 3.5 Settings Screen (Modal)
**Purpose**: App preferences and user customization

**Layout**:
- Modal presentation (slide up)
- Header: title = "Settings", left = Close
- Main content: Scrollable form with sections
- Safe area: top = Spacing.xl, bottom = insets.bottom + Spacing.xl

**Components**:
- Profile section:
  - Avatar (generated preset: "avatar-1.png")
  - Display name field
- Preferences section:
  - Default category picker
  - Sort order (Recent, A-Z, Category)
- About section:
  - App version
  - Privacy policy (placeholder link)
  - Terms of service (placeholder link)

---

## 4. Color Palette

**Primary**: #2D5F5D (Deep teal - sophisticated, calm, content-focused)
**Accent**: #D97757 (Warm terracotta - draws attention to actions)
**Background**: #FAFAF8 (Warm off-white - editorial feel)
**Surface**: #FFFFFF (Pure white for cards)
**Text Primary**: #1A1A1A (Almost black for titles)
**Text Secondary**: #6B6B6B (Medium gray for metadata)
**Text Tertiary**: #A0A0A0 (Light gray for timestamps)
**Border**: #E8E8E6 (Subtle separator lines)
**Error**: #C84141 (Muted red for destructive actions)

---

## 5. Typography

**Font**: Inter (Google Font) - clean, highly readable, modern editorial feel

**Type Scale**:
- **Display**: 32pt, Bold (screen titles)
- **Title**: 24pt, Bold (card titles, section headers)
- **Headline**: 18pt, Semibold (form labels, category names)
- **Body**: 16pt, Regular (notes, descriptions)
- **Caption**: 14pt, Regular (metadata, timestamps)
- **Label**: 12pt, Medium (badges, tags)

---

## 6. Visual Design

- **Icons**: Feather icons from @expo/vector-icons
- **Card Style**: White surface with subtle border (1px, Border color), no shadows
- **Buttons**: Primary = filled with Primary color, Secondary = outlined with Primary color
- **Floating Share Button Shadow**:
  - shadowOffset: {width: 0, height: 2}
  - shadowOpacity: 0.10
  - shadowRadius: 2
- **Category Badges**: Rounded pill shape (100px radius), filled with primary color at 10% opacity, text in Primary color
- **All touchable elements**: Reduce opacity to 0.6 on press

---

## 7. Assets to Generate

1. **icon.png** - App icon featuring a bookmark + lightning bolt symbol in Primary color on Accent background
   - WHERE USED: Device home screen

2. **splash-icon.png** - Simplified version of app icon
   - WHERE USED: Launch screen

3. **empty-library.png** - Minimalist illustration of an open book with sparkles
   - WHERE USED: Library screen when no recommendations exist

4. **empty-categories.png** - Abstract illustration of organized shelves/grid
   - WHERE USED: Categories screen (rare, only if completely empty)

5. **avatar-1.png** - Simple geometric avatar (circle with initials "ME" in Primary color)
   - WHERE USED: Settings screen profile section

6. **success-scan.png** - Checkmark with scanning lines illustration
   - WHERE USED: Add Recommendation modal after successful OCR extraction
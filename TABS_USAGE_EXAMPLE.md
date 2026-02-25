# Tabs Component Usage Guide

## Overview
The Tabs component provides a reusable, accessible tabbed interface following international design standards (Google, Microsoft, AWS style).

## Installation
The Tabs component is located at `src/components/ui/Tabs.tsx`

## Basic Usage

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs"
import { User, Settings, Bell } from "lucide-react"

export default function MyPage() {
  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile" icon={<User className="h-4 w-4" />}>
          Profile
        </TabsTrigger>
        <TabsTrigger value="settings" icon={<Settings className="h-4 w-4" />}>
          Settings
        </TabsTrigger>
        <TabsTrigger value="notifications" icon={<Bell className="h-4 w-4" />}>
          Notifications
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <div className="p-6">
          <h2>Profile Content</h2>
        </div>
      </TabsContent>

      <TabsContent value="settings">
        <div className="p-6">
          <h2>Settings Content</h2>
        </div>
      </TabsContent>

      <TabsContent value="notifications">
        <div className="p-6">
          <h2>Notifications Content</h2>
        </div>
      </TabsContent>
    </Tabs>
  )
}
```

## Controlled Tabs (with state management)

```tsx
import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs"

export default function ControlledTabs() {
  const [activeTab, setActiveTab] = useState("tab1")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
      </TabsList>

      <TabsContent value="tab1">Content 1</TabsContent>
      <TabsContent value="tab2">Content 2</TabsContent>
    </Tabs>
  )
}
```

## Advanced Example: Fleet Management Settings

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { User, Bell, Globe, Shield, Database, Palette } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button>Save Changes</Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general" icon={<User className="h-4 w-4" />}>
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" icon={<Bell className="h-4 w-4" />}>
            Notifications
          </TabsTrigger>
          <TabsTrigger value="regional" icon={<Globe className="h-4 w-4" />}>
            Regional
          </TabsTrigger>
          <TabsTrigger value="appearance" icon={<Palette className="h-4 w-4" />}>
            Appearance
          </TabsTrigger>
          <TabsTrigger value="security" icon={<Shield className="h-4 w-4" />}>
            Security
          </TabsTrigger>
          <TabsTrigger value="data" icon={<Database className="h-4 w-4" />}>
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name</label>
                  <Input placeholder="Enter company name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="company@example.com" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Notification toggles */}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tab contents... */}
      </Tabs>
    </div>
  )
}
```

## Example: Vehicle Details with Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs"
import { Card } from "@/components/ui/Card"
import { Info, Wrench, Fuel, MapPin, FileText } from "lucide-react"

export default function VehicleDetailsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Toyota Hilux - V-001</h1>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" icon={<Info className="h-4 w-4" />}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="maintenance" icon={<Wrench className="h-4 w-4" />}>
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="fuel" icon={<Fuel className="h-4 w-4" />}>
            Fuel History
          </TabsTrigger>
          <TabsTrigger value="trips" icon={<MapPin className="h-4 w-4" />}>
            Trips
          </TabsTrigger>
          <TabsTrigger value="documents" icon={<FileText className="h-4 w-4" />}>
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Vehicle Information</h2>
            {/* Vehicle details */}
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Maintenance History</h2>
            {/* Maintenance records */}
          </Card>
        </TabsContent>

        <TabsContent value="fuel">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Fuel Consumption</h2>
            {/* Fuel records */}
          </Card>
        </TabsContent>

        <TabsContent value="trips">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Trip History</h2>
            {/* Trip records */}
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Vehicle Documents</h2>
            {/* Document list */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

## Props Reference

### Tabs
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| defaultValue | string | required | Initial active tab |
| value | string | undefined | Controlled active tab value |
| onValueChange | (value: string) => void | undefined | Callback when tab changes |
| children | ReactNode | required | Tab components |
| className | string | undefined | Additional CSS classes |

### TabsList
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | required | TabsTrigger components |
| className | string | undefined | Additional CSS classes |

### TabsTrigger
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | required | Unique tab identifier |
| children | ReactNode | required | Tab label |
| icon | ReactNode | undefined | Optional icon |
| className | string | undefined | Additional CSS classes |
| disabled | boolean | false | Disable the tab |

### TabsContent
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | required | Tab identifier (matches TabsTrigger) |
| children | ReactNode | required | Tab content |
| className | string | undefined | Additional CSS classes |

## Features

✅ **Accessible** - Proper ARIA labels and keyboard navigation
✅ **Animated** - Smooth fade-in transitions
✅ **Responsive** - Horizontal scroll on mobile
✅ **Flexible** - Controlled or uncontrolled mode
✅ **Customizable** - Full className support
✅ **Icon Support** - Optional icons in tabs
✅ **International Standard** - Follows Google/Microsoft/AWS design patterns

## Styling

The component uses Tailwind CSS and follows your existing design system:
- Active tab: Primary color with bottom border
- Inactive tabs: Muted text with hover effects
- Smooth transitions on all interactions
- Responsive overflow handling

## Best Practices

1. **Use meaningful tab values**: Use descriptive strings like "general", "security" instead of "tab1", "tab2"
2. **Add icons for clarity**: Icons help users quickly identify tab content
3. **Keep tab labels short**: Use 1-2 words per tab
4. **Limit number of tabs**: 3-7 tabs is optimal, use dropdown for more
5. **Group related content**: Each tab should contain related information
6. **Provide visual feedback**: Use the built-in animations and hover states

## Common Use Cases

- **Settings pages** - Organize different setting categories
- **Detail pages** - Show different aspects of an entity (vehicle, driver, etc.)
- **Dashboard sections** - Switch between different data views
- **Form wizards** - Multi-step forms with tab navigation
- **Report views** - Different report types or time periods

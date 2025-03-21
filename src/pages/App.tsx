import { Button } from "@/components/ui/Button"

export default function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Hello, ShadCN Button!</h1>
      
      <Button>Click Me</Button> {/* ✅ Default Button */}
      
      <Button variant="destructive" size="lg" className="mt-4">
        Delete
      </Button> {/* ✅ Destructive Variant */}

      <Button variant="outline" size="sm" className="mt-4">
        Outline Button
      </Button> {/* ✅ Outline Variant */}
    </div>
  )
}

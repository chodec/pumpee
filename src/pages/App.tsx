// @ts-ignore
import { Button } from "@/components/ui/Button";

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-4">
      <h1 className="text-3xl font-bold">Testing Tailwind</h1>
      
      {/* This div should be green if Tailwind is working */}
      <div className="p-4 mb-4 mt-4 bg-green-500 text-white rounded-lg">
        This div should be green with white text if Tailwind is working
      </div>
      
      {/* Plain button with Tailwind classes */}
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
        Plain button with Tailwind classes
      </button>
      
      {/* Testing shadcn Button component */}
      <div className="flex flex-col gap-2 items-center mt-4">
        <h2 className="text-xl font-semibold">shadcn/ui Button Components</h2>
        <Button>Default Button</Button>
        <Button variant="destructive">Destructive Button</Button>
        <Button variant="outline">Outline Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="ghost">Ghost Button</Button>
        <Button variant="link">Link Button</Button>
        <Button size="sm">Small Button</Button>
        <Button size="lg">Large Button</Button>
        <Button size="icon">Icon</Button>
        <Button variant="outline" size="lg">Large Outline Button</Button>
      </div>
    </div>
  )
}

export default App
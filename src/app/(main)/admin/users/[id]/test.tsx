// Simple test to verify dynamic route works
export default function TestPage({ params }: { params: { id: string } }) {
  console.log("🔍 [TEST PAGE] Accessed with ID:", params.id);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Test Page Works!</h1>
      <p>User ID from URL: {params.id}</p>
    </div>
  );
}

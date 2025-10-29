import { auth, currentUser } from "@clerk/nextjs/server";

export default async function DashboardDebugPage() {
  const { sessionClaims, userId } = await auth();
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Debug: Información de Sesión</h1>

          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-2">auth() - userId</h2>
              <div className="bg-gray-50 p-4 rounded">
                <pre className="text-sm overflow-auto">{userId}</pre>
              </div>
            </div>

            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-2">auth() - sessionClaims</h2>
              <div className="bg-gray-50 p-4 rounded">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(sessionClaims, null, 2)}
                </pre>
              </div>
            </div>

            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-2">currentUser() - Email Info</h2>
              <div className="bg-gray-50 p-4 rounded">
                <p><strong>Primary Email:</strong> {user?.primaryEmailAddress?.emailAddress}</p>
                <p><strong>All Emails:</strong></p>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(user?.emailAddresses, null, 2)}
                </pre>
              </div>
            </div>

            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-2">currentUser() - Metadata</h2>
              <div className="bg-gray-50 p-4 rounded">
                <p><strong>Public Metadata:</strong></p>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(user?.publicMetadata, null, 2)}
                </pre>
              </div>
            </div>

            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-2">Variables de Entorno</h2>
              <div className="bg-gray-50 p-4 rounded">
                <p><strong>ADMIN_EMAILS:</strong> {process.env.ADMIN_EMAILS}</p>
              </div>
            </div>

            <div className="pb-4">
              <h2 className="text-lg font-semibold mb-2">currentUser() - Usuario Completo</h2>
              <div className="bg-gray-50 p-4 rounded">
                <pre className="text-sm overflow-auto max-h-96">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

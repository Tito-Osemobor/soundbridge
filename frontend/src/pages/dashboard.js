import { useEffect, useState } from "react";
import { fetchUser } from "@/services/auth/authService";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser().then(setUser);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {user ? (
        <pre className="mt-4 p-4 bg-gray-100">{JSON.stringify(user, null, 2)}</pre>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
}

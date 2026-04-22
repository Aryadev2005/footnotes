import { Layout } from "@/components/Layout";
import { FriendLogCard } from "@/components/FriendLogCard";
import { useLogs } from "@/hooks/useLogs";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { data: logs = [], isLoading } = useLogs();
  const { displayName } = useAuth();

  return (
    <Layout>
      {/* Greeting */}
      <section className="mb-10">
        <h1 className="font-serif text-2xl font-medium text-foreground">
          Hi {displayName?.split(" ")[0] ?? "there"},
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's what's been happening today
        </p>
      </section>

      {/* Logs from friends */}
      <section>
        <h2 className="mb-4 font-serif text-lg font-semibold text-foreground">
          Logs from your friends
        </h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="flex flex-col gap-4">
            {logs.map((log) => (
              <FriendLogCard key={log.id} log={log} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Index;

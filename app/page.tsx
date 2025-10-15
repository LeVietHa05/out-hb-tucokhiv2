import StateCard from './components/StateCard';
import FingerprintStatus from './components/FingerprintStatus';
import CommandPanel from './components/CommandPanel';
import LogConsole from './components/LogConsole';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Hardware System Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StateCard />
        <FingerprintStatus />
        <CommandPanel />
        <div className="md:col-span-2 lg:col-span-3">
          <LogConsole />
        </div>
      </div>
    </main>
  );
}

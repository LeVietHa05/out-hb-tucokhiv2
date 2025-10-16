import Header from './components/Header';
import ImageDisplay from './components/ImageDisplay';
import UserPanel from './components/UserPanel';
import ActivityLogs from './components/ActivityLogs';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left section - 70% width on large screens */}
          <div className="lg:col-span-2">
            <ImageDisplay />
          </div>

          {/* Right section - 30% width on large screens */}
          <div className="space-y-6">
            <UserPanel />
            <ActivityLogs />
          </div>
        </div>
      </main>
    </div>
  );
}

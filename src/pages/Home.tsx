import { Link } from "react-router-dom";
import {
  Trophy,
  Upload,
  Clock,
  CheckCircle,
  Calendar,
  Users,
} from "lucide-react";
import { useChallenges, usePrefetchLeaderboard } from "../hooks/useChallenges";

const Home = () => {
  const { data: challengesResponse, isLoading, error } = useChallenges();
  const prefetchLeaderboard = usePrefetchLeaderboard();

  const challenges = challengesResponse?.data || [];

  const handleMouseEnter = (challengeId: string) => {
    // Prefetch leaderboard data on hover for better UX
    prefetchLeaderboard(challengeId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "upcoming":
        return <Clock className="w-4 h-4 text-orange-500" />;
      case "completed":
        return <Calendar className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "upcoming":
        return "Upcoming";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "upcoming":
        return "text-orange-600 bg-orange-100";
      case "completed":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading challenges...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
                Error Loading Challenges
              </h2>
              <p className="text-red-600 dark:text-red-400">
                Failed to load challenges. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-0">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            OpenPecha AI Challenges
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Participate in various AI challenges and test your models against
            our benchmarks.
          </p>
        </div>

        {challenges.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No challenges available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-white dark:bg-gray-800 flex flex-col rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                onMouseEnter={() => handleMouseEnter(challenge.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleMouseEnter(challenge.id);
                  }
                }}
              >
                <div className="p-6  flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                        challenge.status
                      )}`}
                    >
                      <div className="flex items-center">
                        {getStatusIcon(challenge.status)}
                        <span className="ml-1">
                          {getStatusText(challenge.status)}
                        </span>
                      </div>
                    </span>
                    <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
                      {challenge.category?.name || "Unknown"}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {challenge.title || challenge.name}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-1">
                    {challenge.description}
                  </p>

                  {/* Challenge Stats */}
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4 space-x-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{challenge.totalSubmissions} </span>
                    </div>
                    <div className="flex items-center">
                      <Trophy className="w-4 h-4 mr-1" />
                      <span>{challenge.evaluationMetric}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Link
                      to={`/leaderboard/${challenge.id}`}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Leaderboard
                    </Link>

                    {challenge.status === "active" ? (
                      <Link
                        to={`/submit/${challenge.id}`}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Submit
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {challenge.status === "upcoming" ? "Soon" : "Closed"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

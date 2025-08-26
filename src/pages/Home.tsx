import { Link } from "react-router-dom";
import {
  Trophy,
  Upload,
  Clock,
  CheckCircle,
  Calendar,
  Users,
  Edit,
} from "lucide-react";
import { useChallenges, usePrefetchLeaderboard } from "../hooks/useChallenges";
import { useCurrentUser } from "../hooks/useUsers";

const Home = () => {
  const { data: challengesResponse, isLoading, error } = useChallenges();
  const { data: currentUserData } = useCurrentUser();
  const prefetchLeaderboard = usePrefetchLeaderboard();
console.log(challengesResponse)
  const challenges = challengesResponse?.data || [];
  const user = currentUserData?.data;
  const isAdmin = user?.role === "admin";

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
      <div className="max-w-7xl mx-auto px-4">
        {/* Modern Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ML Evaluation Challenges
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Discover and participate in machine learning challenges. Test your
            models and compete with others.
          </p>
        </div>

        {challenges.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No challenges available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-300 overflow-hidden"
                onMouseEnter={() => handleMouseEnter(challenge.id)}
              >
                {/* Header with image or gradient */}
                <div className="h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 relative overflow-hidden">
                  {challenge.image_uri ? (
                    <>
                      <img
                        src={challenge.image_uri}
                        alt={challenge.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Dark overlay for better text contrast */}
                      <div className="absolute inset-0 bg-black/30" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600" />
                  )}

                  {/* Status & Category badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md backdrop-blur-sm bg-black/60 text-white border border-white/20 shadow-lg text-shadow-strong`}
                    >
                      {getStatusIcon(challenge.status)}
                      <span className="ml-1">
                        {getStatusText(challenge.status)}
                      </span>
                    </span>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md backdrop-blur-sm bg-black/60 text-white border border-white/20 shadow-lg text-shadow-strong">
                      {challenge.category?.name || "General"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {challenge.title || challenge.name}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-1">
                    {challenge.description}
                  </p>

                  {/* Created Date */}
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>
                      Created{" "}
                      {new Date(challenge.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Link
                        to={`/leaderboard/${challenge.id}`}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        <Trophy className="w-3 h-3 mr-1" />
                        Board
                      </Link>

                      {challenge.status === "active" ? (
                        <Link
                          to={`/submit/${challenge.id}`}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors duration-200"
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          Submit
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-400 text-white text-sm rounded-lg cursor-not-allowed"
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          {challenge.status === "upcoming" ? "Soon" : "Closed"}
                        </button>
                      )}
                    </div>

                    {/* Admin Controls */}
                    {isAdmin && (
                      <Link
                        to={`/admin/edit-challenge/${challenge.id}`}
                        className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Link>
                    )}
                  </div>
                  <a href={challenge.ground_truth} className="text-sm text-gray-500 dark:text-gray-400 mb-4">download</a>
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

import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Medal, Clock, Trophy, Users, Calendar } from "lucide-react";
import { useLeaderboard, useChallenge } from "../hooks/useChallenges";

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Medal className="w-6 h-6 text-yellow-500" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Medal className="w-6 h-6 text-amber-600" />;
    default:
      return (
        <span className="w-6 h-6 flex items-center justify-center text-gray-600 font-semibold">
          {rank}
        </span>
      );
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "evaluated":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Evaluated
        </span>
      );
    case "processing":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Processing
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Failed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>
      );
  }
};

const Leaderboard = () => {
  const { challengeId } = useParams<{ challengeId: string }>();

  const {
    data: challengeResponse,
    isLoading: challengeLoading,
    error: challengeError,
  } = useChallenge(challengeId || "");

  const {
    data: leaderboardResponse,
    isLoading: leaderboardLoading,
    error: leaderboardError,
  } = useLeaderboard(challengeId || "", 1, 50); // Get more entries for leaderboard

  const challenge = challengeResponse?.data;
  const submissions = leaderboardResponse?.data || [];

  const isLoading = challengeLoading || leaderboardLoading;
  const error = challengeError || leaderboardError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Challenges
            </Link>
          </div>
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Error Loading Leaderboard
              </h2>
              <p className="text-red-600">
                {!challenge
                  ? "Challenge not found."
                  : "Failed to load leaderboard data. Please try again later."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Challenges
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  {challenge.name} - Leaderboard
                </h1>
                <p className="text-blue-100">
                  Ranked by {challenge.evaluationMetric} - Lower is better for
                  error rates
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col md:items-end text-sm text-blue-100">
                <div className="flex items-center mb-1">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{challenge.totalSubmissions} total submissions</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>
                    Ends: {new Date(challenge.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {submissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Model Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    {submissions.some((s) => s.accuracy !== undefined) && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accuracy
                      </th>
                    )}
                    {submissions.some((s) => s.f1Score !== undefined) && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        F1 Score
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submission Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getRankIcon(submission.rank)}
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            #{submission.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {submission.modelName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {submission.fileName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {submission.teamName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {(submission.cer * 100).toFixed(2)}%
                        </div>
                      </td>
                      {submissions.some((s) => s.accuracy !== undefined) && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {submission.accuracy
                              ? `${(submission.accuracy * 100).toFixed(2)}%`
                              : "N/A"}
                          </div>
                        </td>
                      )}
                      {submissions.some((s) => s.f1Score !== undefined) && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {submission.f1Score
                              ? `${(submission.f1Score * 100).toFixed(2)}%`
                              : "N/A"}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(submission.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(
                          submission.submissionDate
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                No submissions yet for this challenge.
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Be the first to submit your results!
              </p>
              {challenge.status === "active" && (
                <Link
                  to={`/submit/${challengeId}`}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 rotate-180" />
                  Submit Your Results
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

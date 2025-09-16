import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Trash2,
  BarChart3,
  Table,
} from "lucide-react";
import {
  useChallenges,
  useAllLeaderboards,
  useDeleteSubmission,
} from "../hooks/useChallenges";
import { useCurrentUser } from "../hooks/useUsers";
import ShareButton from "../components/ShareButton";
import LeaderboardChart from "../components/LeaderboardChart";
import LeaderboardActionsMenu from "../components/LeaderboardActionsMenu";
import UserVoteLeaderboard from "../components/UserVoteLeaderboard";
import ModelScoreLeaderboard from "../components/ModelScoreLeaderboard";
import { useToast } from "../components/use-toast";

const Leaderboards = () => {
  const { t } = useTranslation();
  // State to track view mode for each leaderboard (challengeId -> view mode)
  const [viewModes, setViewModes] = useState<Record<string, "table" | "chart">>({});
  // State to track which share modal to show
  const [activeShareModal, setActiveShareModal] = useState<string | null>(null);
  
  const {
    data: challengesResponse,
    isLoading: challengesLoading,
    error: challengesError,
  } = useChallenges();
  const challenges = challengesResponse?.data || [];
  const { data: currentUserData } = useCurrentUser();
  const deleteSubmissionMutation = useDeleteSubmission();
  const { success } = useToast();

  const {
    data: leaderboardsData,
    isLoading: leaderboardsLoading,
    error: leaderboardsError,
  } = useAllLeaderboards(challenges);

  const isLoading = challengesLoading || leaderboardsLoading;
  const error = challengesError || leaderboardsError;
  const user = currentUserData?.data;
  const isAdmin = user?.role === "admin";

  // Toggle view mode for a specific leaderboard
  const toggleViewMode = (challengeId: string) => {
    setViewModes(prev => ({
      ...prev,
      [challengeId]: prev[challengeId] === "chart" ? "table" : "chart"
    }));
  };

  // Get current view mode for a leaderboard (defaults to table)
  const getCurrentViewMode = (challengeId: string): "table" | "chart" => {
    return viewModes[challengeId] || "table";
  };

  const handleDeleteSubmission = async (
    submissionId: string,
    challengeId: string
  ) => {
    if (
      window.confirm(
        "Are you sure you want to delete this submission? This action cannot be undone."
      )
    ) {
      try {
        await deleteSubmissionMutation.mutateAsync({
          submissionId,
          challengeId,
        });
        // Show success toast
        success(
          "Submission deleted successfully! ✅",
          "The submission has been removed from the leaderboard.",
          4000
        );
      } catch (error) {
        console.error("Failed to delete submission:", error);
        alert("Failed to delete submission. Please try again.");
      }
    }
  };


  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-neutral-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center text-neutral-600 dark:text-neutral-400 font-semibold text-sm">
            {rank}
          </span>
        );
    }
  };

  const formatScore = (value: number, metric: string) => {
    // For percentage-based metrics, show as percentage
    if (metric === "CER" || metric === "WER" || metric === "ACCURACY") {
      return `${(value * 100).toFixed(2)}%`;
    }
    // For other metrics, show as decimal
    return value.toFixed(4);
  };

  const getMetricClass = (metric: string) => {
    // Different colors for different metrics
    switch (metric) {
      case "CER":
        return "text-red-600 dark:text-red-400";
      case "WER":
        return "text-orange-600 dark:text-orange-400";
      case "ACCURACY":
        return "text-green-600 dark:text-green-400";
      case "BLEU":
        return "text-primary-600 dark:text-primary-400";
      default:
        return "text-neutral-700 dark:text-neutral-100";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">
              Loading leaderboards...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
                Error Loading Leaderboards
              </h2>
              <p className="text-red-600 dark:text-red-400">
                Failed to load leaderboard data. Please try again later.
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-700 dark:text-neutral-100 mb-2">
            {t('leaderboards.title')}
          </h1>
          <p className=" dark:text-neutral-400 text-sm">
            {t('leaderboards.subtitle')}
          </p>
        </div>

        {/* Leaderboards - 2 column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* User Vote Leaderboard - Second Item */}
          <UserVoteLeaderboard />
          
          {/* Model Arena Score Leaderboard */}
          <div className="bg-white relative dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h2 className="text-md font-semibold text-neutral-500 dark:text-neutral-100">
                    Model Arena Scores
                  </h2>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs dark:text-neutral-400">
                    6 models
                  </span>
                </div>
              </div>
            </div>
            <div className="max-h-96 overflow-hidden">
              <ModelScoreLeaderboard compact={true} />
            </div>
          </div>
          
          {leaderboardsData?.map((leaderboard) => {
            // Get available metrics from first submission
            const availableMetrics =
              leaderboard.submissions.length > 0
                ? Object.keys(leaderboard.submissions[0].metrics || {})
                : [];

            return (
              <div
                key={leaderboard.challengeId}
                className="bg-white relative dark:bg-neutral-800 rounded-lg shadow-sm border  border-neutral-200 dark:border-neutral-700 overflow-hidden"
              >
                {/* Compact Challenge Header */}
                <div className=" px-4 py-2 ">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h2
                        className="text-md  font-semibold  text-neutral-500 dark:text-neutral-100 truncate cursor-help"
                        title={
                          challenges.find(
                            (c) => c.id === leaderboard.challengeId
                          )?.description || leaderboard.challengeTitle
                        }
                      >
                        {leaderboard.challengeTitle}
                      </h2>
                    
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs  dark:text-neutral-400">
                        {leaderboard.submissions.length}
                      </span>
                      
                      {/* View Toggle Buttons */}
                      {leaderboard.submissions.length > 0 && (
                        <div className="flex items-center bg-neutral-100 dark:bg-neutral-600 rounded-md p-0.5">
                          <button
                            onClick={() => toggleViewMode(leaderboard.challengeId)}
                            className={`p-1 rounded text-xs transition-colors duration-200 ${
                              getCurrentViewMode(leaderboard.challengeId) === "table"
                                ? "bg-white dark:bg-neutral-700  dark:text-neutral-100 shadow-sm"
                                : " dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-100"
                            }`}
                            title="Table view"
                          >
                            <Table className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => toggleViewMode(leaderboard.challengeId)}
                            className={`p-1 rounded text-xs transition-colors duration-200 ${
                              getCurrentViewMode(leaderboard.challengeId) === "chart"
                                ? "bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-100 shadow-sm"
                                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-100"
                            }`}
                            title="Chart view"
                          >
                            <BarChart3 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      
                      {/* Hamburger Actions Menu */}
                      <LeaderboardActionsMenu
                        challengeId={leaderboard.challengeId}
                        challengeTitle={leaderboard.challengeTitle || "Challenge"}
                        onShare={() => setActiveShareModal(leaderboard.challengeId)}
                      />
                    </div>
                  </div>
                </div>

                {/* Leaderboard Content - Table or Chart */}
                {leaderboard.submissions.length === 0 && (
                  <div className="text-center py-8">
                    <Trophy className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
                    <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-100 mb-1">
                      No submissions yet
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                      Be the first to submit!
                    </p>
                    <Link
                      to={`/submit/${leaderboard.challengeId}`}
                      className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 transition-colors duration-200"
                    >
                      Submit Results
                    </Link>
                  </div>
                )}
                
                {leaderboard.submissions.length > 0 && getCurrentViewMode(leaderboard.challengeId) === "table" && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium  dark:text-neutral-400 uppercase tracking-wider">
                            #
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium  dark:text-neutral-400 uppercase tracking-wider">
                            {t('leaderboards.model')}
                          </th>
                          {availableMetrics.slice(0, 2).map((metric) => (
                            <th
                              key={metric}
                              className="px-3 py-2 text-left text-xs font-medium  dark:text-neutral-400 uppercase tracking-wider"
                            >
{t(`leaderboards.metrics.${metric}`, metric)}
                            </th>
                          ))}
                          {isAdmin && (
                            <th className="px-3 py-2 text-left text-xs font-medium  dark:text-neutral-400 uppercase tracking-wider">
                              {t('leaderboards.actions')}
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {leaderboard.submissions
                          .slice(0, 8)
                          .map((submission) => (
                            <tr
                              key={
                                submission.submission_id ||
                                `submission-${Math.random()}`
                              }
                              className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-150"
                            >
                              <td className="px-3 py-2 whitespace-nowrap">
                                <div className="flex items-center">
                                  {getRankIcon(submission.rank || 0)}
                                  <span className="ml-1 text-xs font-medium text-neutral-700 dark:text-neutral-100">
                                    {submission.rank || 0}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <div className="text-xs font-medium text-neutral-700 dark:text-neutral-100 truncate max-w-32">
                                  {submission.model_name}
                                </div>
                              </td>
                              {availableMetrics.slice(0, 2).map((metric) => (
                                <td
                                  key={metric}
                                  className="px-3 py-2 whitespace-nowrap"
                                >
                                  <div
                                    className={`text-xs font-semibold ${getMetricClass(
                                      metric
                                    )}`}
                                  >
                                    {submission.metrics[metric] !== undefined
                                      ? formatScore(
                                          submission.metrics[metric],
                                          metric
                                        )
                                      : "-"}
                                  </div>
                                </td>
                              ))}
                            
                              {isAdmin && (
                                <td className="px-3 py-2 whitespace-nowrap">
                                  <button
                                    onClick={() =>
                                      handleDeleteSubmission(
                                        submission.submission_id || "",
                                        leaderboard.challengeId
                                      )
                                    }
                                    disabled={
                                      deleteSubmissionMutation.isPending
                                    }
                                    className="inline-flex items-center px-1 py-1 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Delete submission"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {leaderboard.submissions.length > 0 && getCurrentViewMode(leaderboard.challengeId) === "chart" && (
                  <LeaderboardChart
                    submissions={leaderboard.submissions}
                    availableMetrics={availableMetrics}
                    className="p-4"
                  />
                )}
                <Link
                  to={`/leaderboard/${leaderboard.challengeId}`}
                  className="w-full flex items-center bottom-0 absolute justify-center bg-neutral-100   hover:bg-neutral-200 dark:hover:bg-neutral-700 dark:bg-neutral-700 p-3 text-center  text-neutral-500 dark:text-neutral-200 ">View all</Link>
              </div>
            );
          })}
        </div>

        {leaderboardsData?.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-100 mb-2">
              No leaderboards available
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Check back later when challenges have submissions.
            </p>
          </div>
        )}
      </div>

      {/* Share Modals */}
      {activeShareModal && (
        <button 
          className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50"
          onClick={() => setActiveShareModal(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setActiveShareModal(null);
            }
          }}
          aria-label="Close share modal"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto"
          >
            <ShareButton
              challengeId={activeShareModal}
              challengeTitle={
                leaderboardsData?.find(lb => lb.challengeId === activeShareModal)?.challengeTitle || "Challenge"
              }
              autoOpen={true}
              onClose={() => setActiveShareModal(null)}
            />
          </div>
        </button>
      )}
    </div>
  );
};

export default Leaderboards;

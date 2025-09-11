import { useParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Medal,
  Trophy,
  Users,
  Calendar,
  Edit,
  Trash2,
  BarChart3,
  Table,
  Search,
  Filter,
} from "lucide-react";
import {
  useLeaderboard,
  useChallenge,
  useDeleteSubmission,
} from "../hooks/useChallenges";
import { useCurrentUser } from "../hooks/useUsers";
import ShareButton from "../components/ShareButton";
import LeaderboardChart from "../components/LeaderboardChart";
import { useToast } from "../components/use-toast";

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Medal className="w-6 h-6 text-yellow-500" />;
    case 2:
      return <Medal className="w-6 h-6 text-neutral-400" />;
    case 3:
      return <Medal className="w-6 h-6 text-amber-600" />;
    default:
      return (
        <span className="w-6 h-6 flex items-center justify-center text-neutral-600 dark:text-neutral-400 font-semibold">
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
      return "text-neutral-600 dark:text-neutral-100";
  }
};

const Leaderboard = () => {
  const { t } = useTranslation();
  const { challengeId } = useParams<{ challengeId: string }>();
  const [viewMode, setViewMode] = useState<"table" | "chart">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMetric, setSelectedMetric] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { data: currentUserData } = useCurrentUser();
  const deleteSubmissionMutation = useDeleteSubmission();
  const { success } = useToast();

  const {
    data: leaderboardResponse,
    isLoading: leaderboardLoading,
    error: leaderboardError,
  } = useLeaderboard(challengeId || "", 1, 50); // Get top 50

  const {
    data: challengeResponse,
    isLoading: challengeLoading,
    error: challengeError,
  } = useChallenge(challengeId || "");

  const challenge = challengeResponse?.data;
  const submissions = leaderboardResponse?.data || [];
  const pagination = leaderboardResponse?.pagination;
  const user = currentUserData?.data;
  const isAdmin = user?.role === "admin";
 // Get available metrics from submissions
 const availableMetrics =
 submissions.length > 0 ? Object.keys(submissions[0].metrics || {}) : [];

  // Filter and sort submissions based on search and filters
  const filteredAndSortedSubmissions = useMemo(() => {
    let filtered = [...submissions];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(submission => 
        submission.model_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.submission_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply metric filter and sorting
    if (selectedMetric !== "all" && availableMetrics.includes(selectedMetric)) {
      // Filter out submissions that don't have the selected metric
      filtered = filtered.filter(submission => 
        submission.metrics[selectedMetric] !== undefined
      );

      // Sort by the selected metric
      filtered.sort((a, b) => {
        const aValue = a.metrics[selectedMetric];
        const bValue = b.metrics[selectedMetric];
        
        if (sortOrder === "asc") {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
    } else {
      // Default sort by rank
      filtered.sort((a, b) => (a.rank || 0) - (b.rank || 0));
    }

    return filtered;
  }, [submissions, searchQuery, selectedMetric, sortOrder, availableMetrics]);

  const handleDeleteSubmission = async (submissionId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this submission? This action cannot be undone."
      )
    ) {
      try {
        await deleteSubmissionMutation.mutateAsync({
          submissionId,
          challengeId: challengeId || "",
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

  if (challengeLoading || leaderboardLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">
              Loading leaderboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (challengeError || leaderboardError || !challenge) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-6">
            <Link
              to="/leaderboards"
              className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Leaderboards
            </Link>
          </div>
          <div className="text-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
                Error Loading Leaderboard
              </h2>
              <p className="text-red-600 dark:text-red-400">
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
    <div className="py-0">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/leaderboards"
            className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leaderboards
          </Link>
        </div>

        {/* Challenge Info Header */}
        <div className="bg-gradient-to-r  rounded-lg shadow-lg p-6 mb-8">
          <div className="text-neutral-700 dark:text-neutral-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-neutral-700 dark:text-neutral-100 text-3xl font-bold mb-2">
                  {challenge.title || challenge.name}
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400 mb-4">{challenge.description}</p>
              </div>
              {/* View Toggle, Admin Controls & Share Button */}
              <div className="flex flex-wrap items-center space-x-6 text-sm">
                <div className="flex items-start flex-col">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">Submissions</span>
                  <span className="text-lg mt-2 font-medium text-neutral-700 dark:text-neutral-100">{pagination?.total || 0} </span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400 capitalize">Last updated</span>
                  <span className="text-lg mt-2 font-medium text-neutral-700 dark:text-neutral-100">
                    {new Date(challenge.updated_at).toLocaleDateString()}
                  </span>
                </div>
            </div>
              
            </div>
            <div className="flex items-center justify-between space-x-2">
                {/* View Toggle Buttons */}
                {submissions.length > 0 && (
                  <div className="flex items-center bg-neutral-500/20 dark:bg-neutral-900 rounded-lg p-0.5">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`px-3 py-1 rounded text-sm transition-colors duration-200  ${
                        viewMode === "table"
                          ? "bg-neutral-500/30 text-neutral-700 dark:text-neutral-100 shadow-sm"
                          : "text-neutral-500/70 hover:text-neutral-700 dark:hover:text-neutral-100"
                      }`}
                      title="Table view"
                    >
                      <Table className="w-4 h-4 mr-1 inline-block" />
                    </button>
                    <button
                      onClick={() => setViewMode("chart")}
                      className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
                        viewMode === "chart"
                          ? "bg-neutral-500/30 text-neutral-700 dark:text-neutral-100 shadow-sm"
                          : "text-neutral-500/70 hover:text-neutral-700 dark:hover:text-neutral-100"
                      }`}
                      title="Chart view"
                    >
                      <BarChart3 className="w-4 h-4 mr-1 inline-block" />
                    </button>
                  </div>
                )}
                
              
                <div className="flex gap-2"> 
                  <ShareButton
                  challengeId={challengeId || ""}
                  challengeTitle={
                    challenge.title || challenge.name || "Leaderboard"
                  }
              
                />
                    {isAdmin && (
                    <Link
                      to={`/admin/edit-challenge/${challengeId}`}
                      className="inline-flex items-center px-4 py-2 bg-neutral-500/20 text-neutral-700 dark:text-neutral-100 rounded-lg hover:bg-neutral-500/30 transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                    </Link>
                  )}
                  </div>
              </div>
          </div>
        </div>

        {submissions.length > 0 && (
            <div className="  mb-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by model name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md leading-5 bg-neutral-50 dark:bg-neutral-800 placeholder-neutral-500 dark:placeholder-neutral-300 text-neutral-600 dark:text-neutral-100 focus:outline-none focus:placeholder-neutral-400 dark:focus:placeholder-neutral-200 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                {/* Metric Filter */}
                {availableMetrics.length > 0 && (
                  <div className="lg:w-56">
                    <select
                      value={selectedMetric}
                      onChange={(e) => setSelectedMetric(e.target.value)}
                      className="block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="all">All Metrics</option>
                      {availableMetrics.map((metric) => (
                        <option key={metric} value={metric}>
                          Sort by {metric}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* Sort Order Toggle */}
                {selectedMetric !== "all" && (
                  <div className="flex items-center">
                    <button
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className="inline-flex items-center rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                      title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {sortOrder === "asc" ? "Low to High" : "High to Low"}
                    </button>
                  </div>
                )}
              </div>
              
         
            </div>
          )}


        {/* Leaderboard */}
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden">
          
          {/* Search and Filter Controls */}
        

          {submissions.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-100 mb-2">
                No submissions yet
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Be the first to submit your results to this challenge!
              </p>
              <Link
                to={`/submit/${challengeId}`}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                Submit Results
              </Link>
            </div>
          )}
          
          {/* No results after filtering */}
          {submissions.length > 0 && filteredAndSortedSubmissions.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-100 mb-2">
                No submissions found
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Try adjusting your search or filter criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedMetric("all");
                }}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                Clear All Filters
              </button>
            </div>
          )}
          
          {filteredAndSortedSubmissions.length > 0 && viewMode === "table" && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Description
                    </th>
                    {availableMetrics.map((metric) => (
                      <th
                        key={metric}
                        className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
                      >
                        {metric}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Submitted
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        {t('leaderboards.actions')}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-neutral-50 dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                  {filteredAndSortedSubmissions.map((submission, index) => (
                    <tr
                      key={submission.submission_id}
                      className="hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getRankIcon(submission.rank || 0)}
                          <span className="ml-2 text-sm font-medium text-neutral-600 dark:text-neutral-100">
                            #{submission.rank || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-600 dark:text-neutral-100">
                          {submission.model_name}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          ID: {submission.submission_id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-600 dark:text-neutral-100 max-w-xs truncate">
                          {submission.description}
                        </div>
                      </td>
                      {availableMetrics.map((metric) => (
                        <td
                          key={metric}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          <div
                            className={`text-sm font-semibold ${getMetricClass(
                              metric
                            )}`}
                          >
                            {submission.metrics[metric] !== undefined
                              ? formatScore(submission.metrics[metric], metric)
                              : "-"}
                          </div>
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-600 dark:text-neutral-100">
                          {new Date(submission.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          {new Date(submission.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() =>
                              handleDeleteSubmission(submission.submission_id)
                            }
                            disabled={deleteSubmissionMutation.isPending}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete submission"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            {deleteSubmissionMutation.isPending
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {filteredAndSortedSubmissions.length > 0 && viewMode === "chart" && (
            <LeaderboardChart
              submissions={filteredAndSortedSubmissions}
              availableMetrics={availableMetrics}
              className="py-6"
            />
          )}
        </div>

   
      </div>
    </div>
  );
};

export default Leaderboard;

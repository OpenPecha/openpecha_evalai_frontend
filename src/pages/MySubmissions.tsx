import { useState } from "react";
import { Link } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import {
  FileText,
  Trophy,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react";

// Mock data - in a real app this would come from an API
const mockUserSubmissions = [
  {
    id: "1",
    challengeId: "ocr-tibetan",
    challengeName: "Tibetan OCR Challenge",
    modelName: "MyTibetanOCR-v1.0",
    cer: 0.067,
    accuracy: 0.933,
    f1Score: 0.941,
    rank: 3,
    submissionDate: "2024-01-15T10:30:00Z",
    status: "evaluated",
    fileName: "my_ocr_results.json",
    fileSize: 2048,
  },
  {
    id: "2",
    challengeId: "nlp-sentiment",
    challengeName: "Sentiment Analysis Challenge",
    modelName: "SentimentAnalyzer-v2.1",
    cer: 0.092,
    accuracy: 0.908,
    f1Score: 0.915,
    rank: 4,
    submissionDate: "2024-01-18T14:22:00Z",
    status: "evaluated",
    fileName: "sentiment_results.json",
    fileSize: 1567,
  },
  {
    id: "3",
    challengeId: "ocr-tibetan",
    challengeName: "Tibetan OCR Challenge",
    modelName: "MyTibetanOCR-v2.0",
    cer: 0.0,
    accuracy: 0.0,
    f1Score: 0.0,
    rank: 0,
    submissionDate: "2024-01-20T09:15:00Z",
    status: "processing",
    fileName: "ocr_v2_results.json",
    fileSize: 2234,
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "evaluated":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
          <CheckCircle className="w-3 h-3 mr-1" />
          Evaluated
        </span>
      );
    case "processing":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400">
          <Clock className="w-3 h-3 mr-1" />
          Processing
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
          {status}
        </span>
      );
  }
};

const MySubmissions = () => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");

  const filteredSubmissions = mockUserSubmissions
    .filter((submission) => {
      if (filterStatus === "all") return true;
      return submission.status === filterStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(b.submissionDate).getTime() -
            new Date(a.submissionDate).getTime()
          );
        case "rank":
          return (a.rank || 999) - (b.rank || 999);
        case "score":
          return a.cer - b.cer;
        default:
          return 0;
      }
    });

  return (
    <ProtectedRoute>
      <div className="py-0">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Submissions
            </h1>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Track all your challenge submissions and their performance.
            </p>
          </div>

          {/* Filters and Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                  <label
                    htmlFor="status-filter"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600"
                  >
                    Status:
                  </label>
                  <select
                    id="status-filter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="ml-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="evaluated">Evaluated</option>
                    <option value="processing">Processing</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <label
                    htmlFor="sort-by"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600"
                  >
                    Sort by:
                  </label>
                  <select
                    id="sort-by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="ml-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="date">Date</option>
                    <option value="rank">Rank</option>
                    <option value="score">Score</option>
                  </select>
                </div>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                {filteredSubmissions.length} submission
                {filteredSubmissions.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Submissions List */}
          {filteredSubmissions.length > 0 ? (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {submission.modelName}
                        </h3>
                        {getStatusBadge(submission.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">
                            Challenge
                          </p>
                          <Link
                            to={`/leaderboard/${submission.challengeId}`}
                            className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          >
                            {submission.challengeName}
                          </Link>
                        </div>

                        {submission.status === "evaluated" && (
                          <>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">
                                Rank
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {submission.rank
                                  ? `#${submission.rank}`
                                  : "N/A"}
                              </p>
                            </div>

                            <div>
                              <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">
                                Score
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {(submission.cer * 100).toFixed(2)}%
                              </p>
                            </div>

                            <div>
                              <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">
                                Accuracy
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {submission.accuracy
                                  ? `${(submission.accuracy * 100).toFixed(2)}%`
                                  : "N/A"}
                              </p>
                            </div>
                          </>
                        )}

                        {submission.status === "processing" && (
                          <div className="md:col-span-3">
                            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">
                              Processing
                            </p>
                            <p className="font-medium text-yellow-600 dark:text-yellow-400">
                              Your submission is being evaluated...
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col lg:items-end text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(
                          submission.submissionDate
                        ).toLocaleDateString()}
                      </div>
                      <div className="text-xs">
                        {submission.fileName} (
                        {(submission.fileSize / 1024).toFixed(1)} KB)
                      </div>
                      <div className="mt-2">
                        <Link
                          to={`/leaderboard/${submission.challengeId}`}
                          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <Trophy className="w-4 h-4 mr-1" />
                          View Leaderboard
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No submissions found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-6">
                {filterStatus === "all"
                  ? "You haven't made any submissions yet."
                  : `No submissions with status "${filterStatus}".`}
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Browse Challenges
              </Link>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default MySubmissions;

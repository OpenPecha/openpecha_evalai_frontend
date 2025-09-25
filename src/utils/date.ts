/**
 * Format a UTC date string to a human-readable relative time in local timezone
 * @param dateString UTC ISO date string (e.g., "2025-09-25T09:07:27.029318")
 * @returns Formatted relative time string in local timezone
 */
export const formatRelativeTime = (dateString: string): string => {
    try {
      // Parse UTC date string and convert to local time
      const utcDate = new Date(dateString + (dateString.includes('Z') ? '' : 'Z'));
      const localDate = new Date(utcDate.getTime());
      const now = new Date();
      
      const diffInSeconds = Math.floor((now.getTime() - localDate.getTime()) / 1000);
  
      // Handle future dates
      if (diffInSeconds < 0) {
        const futureDiffInSeconds = Math.abs(diffInSeconds);
        if (futureDiffInSeconds < 60) {
          return 'In a few seconds';
        } else if (futureDiffInSeconds < 3600) {
          const minutes = Math.floor(futureDiffInSeconds / 60);
          return `In ${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else if (futureDiffInSeconds < 86400) {
          const hours = Math.floor(futureDiffInSeconds / 3600);
          return `In ${hours} hour${hours > 1 ? 's' : ''}`;
        } else {
          return `In ${Math.floor(futureDiffInSeconds / 86400)} day${Math.floor(futureDiffInSeconds / 86400) > 1 ? 's' : ''}`;
        }
      }
  
      // Handle past dates
      if (diffInSeconds < 30) {
        return 'Just now';
      } else if (diffInSeconds < 60) {
        return `${diffInSeconds} seconds ago`;
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 2592000) { // 30 days
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 31536000) { // 1 year
        const months = Math.floor(diffInSeconds / 2592000);
        return `${months} month${months > 1 ? 's' : ''} ago`;
      } else {
        const years = Math.floor(diffInSeconds / 31536000);
        return `${years} year${years > 1 ? 's' : ''} ago`;
      }
    } catch (error) {
      console.error("Error formatting relative time:", error);
      return 'Unknown';
    }
  };
  
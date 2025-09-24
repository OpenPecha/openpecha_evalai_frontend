# React Query Implementation Guide

This document outlines the React Query implementation in your frontend application.

## 🎯 What Was Implemented

### 1. Core Setup
- ✅ React Query is already installed (`@tanstack/react-query`)
- ✅ QueryClient configured in `main.tsx` with optimal defaults
- ✅ React Query DevTools added for development debugging

### 2. Custom Hooks Created

#### Template Operations (`hooks/useTemplates.ts`)
- `useTemplates(challengeId, page)` - Fetch templates for a challenge
- `useTemplate(id)` - Fetch single template by ID
- `useCreateTemplate()` - Create new template with optimistic updates
- `usePrefetchTemplate()` - Prefetch template details
- `useInvalidateTemplates()` - Cache invalidation utilities

#### Arena Challenge Operations (`hooks/useArenaChallenge.ts`)
- `useArenaChallenges()` - Fetch all arena challenges
- `useFilteredArenaChallenges(query)` - Fetch filtered challenges
- `useArenaCategories()` - Fetch challenge categories
- `useArenaRanking(challengeId)` - Fetch rankings for a challenge
- `useCreateArenaChallenge()` - Create new challenge
- `usePrefetchArenaData()` - Prefetch related data

#### User Operations (`hooks/useUser.ts`)
- `useCurrentUser()` - Fetch current authenticated user
- `useUser(id)` - Fetch user by ID
- `useUsers()` - Fetch all users
- `useUserLeaderboard()` - Fetch user leaderboard
- `useCreateUser()`, `useUpdateUser()`, `useDeleteUser()` - User mutations

### 3. Components Refactored

#### Template Component (`components/Template.tsx`)
- ✅ Replaced `useEffect` + `useState` with React Query hooks
- ✅ Automatic error handling and retry functionality
- ✅ Optimistic updates for template creation
- ✅ Loading states managed by React Query
- ✅ Manual refetch capability with retry button

#### Error Handling (`components/QueryErrorBoundary.tsx`)
- ✅ Custom error boundary for React Query errors
- ✅ Automatic error recovery with retry functionality
- ✅ User-friendly error messages

### 4. Examples and Best Practices
- ✅ Comprehensive examples in `examples/ReactQueryExamples.tsx`
- ✅ Demonstrates all major React Query patterns

## 🚀 Key Benefits You're Now Getting

### Automatic Caching
- Data is cached and shared across components
- No duplicate API calls for the same data
- Intelligent cache invalidation

### Background Refetching
- Data stays fresh automatically
- Configurable stale time and cache time
- Window focus refetching

### Optimistic Updates
- UI updates immediately on mutations
- Automatic rollback on errors
- Better user experience

### Error Handling
- Consistent error states across the app
- Automatic retry logic (3 retries by default)
- Exponential backoff for retries

### Loading States
- Built-in loading indicators
- No need to manage loading state manually
- Proper loading state coordination

### Developer Experience
- React Query DevTools for debugging
- Query inspection and cache visualization
- Performance monitoring

## 🔧 How to Use

### Basic Data Fetching
```tsx
import { useTemplates } from '../hooks/useTemplates';

function MyComponent({ challengeId }) {
  const { data: templates, isLoading, error } = useTemplates(challengeId, 1);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {templates.map(template => (
        <div key={template.id}>{template.name}</div>
      ))}
    </div>
  );
}
```

### Mutations with Optimistic Updates
```tsx
import { useCreateTemplate } from '../hooks/useTemplates';

function CreateTemplateForm() {
  const createTemplateMutation = useCreateTemplate();
  
  const handleSubmit = (formData) => {
    createTemplateMutation.mutate(formData, {
      onSuccess: () => {
        console.log('Template created!');
        // Cache is automatically updated
      },
      onError: (error) => {
        console.error('Failed to create template:', error);
      }
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button 
        type="submit" 
        disabled={createTemplateMutation.isPending}
      >
        {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
      </button>
    </form>
  );
}
```

### Error Boundaries
```tsx
import { QueryErrorBoundary } from '../components/QueryErrorBoundary';

function App() {
  return (
    <QueryErrorBoundary>
      <MyDataFetchingComponent />
    </QueryErrorBoundary>
  );
}
```

## 🛠 Development Tools

### React Query DevTools
- Open your app in development mode
- Look for the React Query DevTools icon (usually bottom-right)
- Inspect queries, mutations, and cache state
- Monitor performance and network requests

### Query Keys Structure
All query keys follow a hierarchical structure:
```
templates/
  ├── list/challengeId/page
  └── detail/templateId

arena-challenges/
  ├── list/filters
  ├── categories
  └── rankings/challengeId

users/
  ├── me
  ├── list/filters
  ├── detail/userId
  └── leaderboard
```

## 📚 Next Steps

### Components to Migrate
Consider migrating these components to use React Query:
1. `pages/Arena.tsx` - Replace direct API calls with hooks
2. `components/ArenaRanking.tsx` - Use ranking hooks
3. Any other components making direct API calls

### Additional Patterns
- Implement infinite queries for pagination
- Add mutation queues for offline support
- Implement optimistic updates for more operations

## 🔍 Debugging Tips

1. **Use DevTools**: Always check React Query DevTools first
2. **Query Keys**: Ensure query keys are consistent and unique
3. **Error Boundaries**: Wrap components in QueryErrorBoundary
4. **Network Tab**: Check actual network requests vs cached responses
5. **Console Logs**: React Query logs helpful information in development

## 📖 Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [React Query Examples](./src/examples/ReactQueryExamples.tsx)
- [Query Keys Best Practices](https://tkdodo.eu/blog/effective-react-query-keys)

---

Your React Query implementation is now complete and ready to use! 🎉

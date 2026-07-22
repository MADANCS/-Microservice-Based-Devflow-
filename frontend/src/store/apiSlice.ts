import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_API_URL || '/api/v1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    }
  }),
  tagTypes: ['Project', 'Task', 'Sprint', 'User'],
  endpoints: (builder) => ({
    getProjects: builder.query({
      query: () => '/projects',
      providesTags: ['Project'],
      transformResponse: (response: any) => response.data || response,
    }),
    getBoardTasks: builder.query({
      query: ({ projectId, sprintId }) => `/boards?projectId=${projectId}${sprintId ? `&sprintId=${sprintId}` : ''}`,
      providesTags: ['Task'],
      transformResponse: (response: any) => response.data || response,
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: any) => response.data || response,
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response: any) => response.data || response,
    })
  }),
})

export const { 
  useGetProjectsQuery, 
  useGetBoardTasksQuery,
  useLoginMutation,
  useRegisterMutation
} = apiSlice

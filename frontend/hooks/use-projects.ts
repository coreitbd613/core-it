"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  addCredential,
  addMilestone,
  addTeamMember,
  adminFileRevisionRequest,
  createMyProject,
  createProject,
  deleteCredential,
  deleteMilestone,
  deleteProject,
  deleteTeamMember,
  fileMyRevisionRequest,
  getAdminProject,
  getAdminProjects,
  getMyProject,
  getMyProjects,
  respondToRevisionRequest,
  updateCredential,
  updateMilestone,
  updateProject,
  updateProjectStatus,
  updateTeamMember,
  type CreateCredentialInput,
  type CreateMilestoneInput,
  type CreateProjectInput,
  type CreateRevisionRequestInput,
  type CreateTeamMemberInput,
  type Project,
  type ProjectStatus,
  type RespondRevisionRequestInput,
  type UpdateCredentialInput,
  type UpdateMilestoneInput,
  type UpdateProjectInput,
  type UpdateTeamMemberInput,
} from "@/lib/projects"

const myProjectsKey = (organizationId?: string) => ["projects", "mine", organizationId ?? null] as const
const myProjectKey = (id: string) => ["projects", "mine", "detail", id] as const
const adminProjectsKey = (filters?: { organizationId?: string; status?: ProjectStatus }) =>
  ["projects", "admin", filters ?? {}] as const
const adminProjectKey = (id: string) => ["projects", "admin", id] as const

export function useMyProjects(organizationId?: string) {
  return useQuery({
    queryKey: myProjectsKey(organizationId),
    queryFn: () => getMyProjects(organizationId),
  })
}

export function useMyProject(id: string) {
  return useQuery({
    queryKey: myProjectKey(id),
    queryFn: () => getMyProject(id),
    enabled: Boolean(id),
  })
}

export function useAdminProjects(filters?: { organizationId?: string; status?: ProjectStatus }) {
  return useQuery({
    queryKey: adminProjectsKey(filters),
    queryFn: () => getAdminProjects(filters),
  })
}

export function useAdminProject(id: string) {
  return useQuery({
    queryKey: adminProjectKey(id),
    queryFn: () => getAdminProject(id),
    enabled: Boolean(id),
  })
}

function useInvalidateProjectLists() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["projects", "admin"] })
    void queryClient.invalidateQueries({ queryKey: ["projects", "mine"] })
  }
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  const invalidateLists = useInvalidateProjectLists()

  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(input),
    onSuccess: (project: Project) => {
      queryClient.setQueryData(adminProjectKey(project.id), project)
      invalidateLists()
    },
  })
}

export function useCreateMyProject() {
  const queryClient = useQueryClient()
  const invalidateLists = useInvalidateProjectLists()

  return useMutation({
    mutationFn: (input: CreateProjectInput) => createMyProject(input),
    onSuccess: (project: Project) => {
      queryClient.setQueryData(myProjectKey(project.id), project)
      invalidateLists()
    },
  })
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient()
  const invalidateLists = useInvalidateProjectLists()

  return useMutation({
    mutationFn: (input: UpdateProjectInput) => updateProject(id, input),
    onSuccess: (project: Project) => {
      queryClient.setQueryData(adminProjectKey(id), project)
      invalidateLists()
    },
  })
}

export function useUpdateProjectStatus(id: string) {
  const queryClient = useQueryClient()
  const invalidateLists = useInvalidateProjectLists()

  return useMutation({
    mutationFn: (status: ProjectStatus) => updateProjectStatus(id, status),
    onSuccess: (project: Project) => {
      queryClient.setQueryData(adminProjectKey(id), project)
      invalidateLists()
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  const invalidateLists = useInvalidateProjectLists()

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: adminProjectKey(id) })
      invalidateLists()
    },
  })
}

function useRefetchProject(projectId: string) {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: adminProjectKey(projectId) })
    void queryClient.invalidateQueries({ queryKey: myProjectKey(projectId) })
  }
}

export function useAddMilestone(projectId: string) {
  const refetch = useRefetchProject(projectId)
  return useMutation({
    mutationFn: (input: CreateMilestoneInput) => addMilestone(projectId, input),
    onSuccess: refetch,
  })
}

export function useUpdateMilestone(projectId: string) {
  const refetch = useRefetchProject(projectId)
  return useMutation({
    mutationFn: ({ milestoneId, input }: { milestoneId: string; input: UpdateMilestoneInput }) =>
      updateMilestone(projectId, milestoneId, input),
    onSuccess: refetch,
  })
}

export function useDeleteMilestone(projectId: string) {
  const refetch = useRefetchProject(projectId)
  return useMutation({
    mutationFn: (milestoneId: string) => deleteMilestone(projectId, milestoneId),
    onSuccess: refetch,
  })
}

export function useAdminFileRevisionRequest(projectId: string) {
  const refetch = useRefetchProject(projectId)
  return useMutation({
    mutationFn: (input: CreateRevisionRequestInput) => adminFileRevisionRequest(projectId, input),
    onSuccess: refetch,
  })
}

export function useFileMyRevisionRequest(projectId: string) {
  const refetch = useRefetchProject(projectId)
  return useMutation({
    mutationFn: (input: CreateRevisionRequestInput) => fileMyRevisionRequest(projectId, input),
    onSuccess: refetch,
  })
}

export function useRespondToRevisionRequest(projectId: string) {
  const refetch = useRefetchProject(projectId)
  return useMutation({
    mutationFn: ({ revisionId, input }: { revisionId: string; input: RespondRevisionRequestInput }) =>
      respondToRevisionRequest(projectId, revisionId, input),
    onSuccess: refetch,
  })
}

export function useAddCredential(projectId: string) {
  const refetch = useRefetchProject(projectId)
  return useMutation({
    mutationFn: (input: CreateCredentialInput) => addCredential(projectId, input),
    onSuccess: refetch,
  })
}

export function useUpdateCredential(projectId: string) {
  const refetch = useRefetchProject(projectId)
  return useMutation({
    mutationFn: ({ credentialId, input }: { credentialId: string; input: UpdateCredentialInput }) =>
      updateCredential(projectId, credentialId, input),
    onSuccess: refetch,
  })
}

export function useDeleteCredential(projectId: string) {
  const refetch = useRefetchProject(projectId)
  return useMutation({
    mutationFn: (credentialId: string) => deleteCredential(projectId, credentialId),
    onSuccess: refetch,
  })
}

export function useAddTeamMember(projectId: string) {
  const refetch = useRefetchProject(projectId)
  return useMutation({
    mutationFn: (input: CreateTeamMemberInput) => addTeamMember(projectId, input),
    onSuccess: refetch,
  })
}

export function useUpdateTeamMember(projectId: string) {
  const refetch = useRefetchProject(projectId)
  return useMutation({
    mutationFn: ({ teamMemberId, input }: { teamMemberId: string; input: UpdateTeamMemberInput }) =>
      updateTeamMember(projectId, teamMemberId, input),
    onSuccess: refetch,
  })
}

export function useDeleteTeamMember(projectId: string) {
  const refetch = useRefetchProject(projectId)
  return useMutation({
    mutationFn: (teamMemberId: string) => deleteTeamMember(projectId, teamMemberId),
    onSuccess: refetch,
  })
}

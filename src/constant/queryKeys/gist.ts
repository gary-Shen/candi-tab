// 消息列表
export const gistKeys = {
  all: ['gist'] as const,
  lists: () => [...gistKeys.all, 'list'] as const,
  list: (filters: string) => [...gistKeys.lists(), { filters }] as const,
  details: () => [...gistKeys.all, 'detail'] as const,
  detail: (id: string) => [...gistKeys.details(), id] as const,
}

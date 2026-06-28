import type {Test, TestIndexEntry} from "~/types/tests";

export function useTests() {
  const {data: index, refresh: refreshIndex} =
    useFetch<TestIndexEntry[]>("/api/tests");

  async function fetchTest(id: string): Promise<Test | null> {
    try {
      return await $fetch<Test>(`/api/tests/${id}`);
    } catch {
      return null;
    }
  }

  function getTodayTest(entries: TestIndexEntry[]): TestIndexEntry | undefined {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const today = `${y}-${m}-${d}`;
    return entries.find((e) => e.date === today || e.id === today);
  }

  function getLatestTests(
    entries: TestIndexEntry[],
    limit = 5,
  ): TestIndexEntry[] {
    return [...entries]
      .sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0))
      .slice(0, limit);
  }

  return {index, refreshIndex, fetchTest, getTodayTest, getLatestTests};
}

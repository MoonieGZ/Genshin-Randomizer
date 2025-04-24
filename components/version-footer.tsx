"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "./language-provider"

export function VersionFooter() {
  const [commitId, setCommitId] = useState<string>("loading...")
  const [commitDate, setCommitDate] = useState<string>("")
  const { t } = useLanguage()

  useEffect(() => {
    async function fetchLatestCommit() {
      try {
        const response = await fetch("https://api.github.com/repos/MoonieGZ/Genshin-Randomizer/commits/main")
        if (response.ok) {
          const data = await response.json()
          // Get the first 7 characters of the commit SHA (short version)
          setCommitId(data.sha.substring(0, 7))
          // Format the date to yyyy-MM-dd
          const date = new Date(data.commit.author.date)
          const formattedDate = date.toISOString().split('T')[0]
          setCommitDate(formattedDate)
        } else {
          setCommitId("unknown")
          setCommitDate("")
        }
      } catch (error) {
        console.error("Error fetching commit ID:", error)
        setCommitId("unknown")
        setCommitDate("")
      }
    }

    fetchLatestCommit()
  }, [])

  return (
    <div className="text-center text-sm text-muted-foreground">
      {t("footer.version")}{" "}
      <a
        href={`https://github.com/MoonieGZ/Genshin-Randomizer/commit/${commitId}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {commitId}
      </a>
      {commitDate && ` (${commitDate})`} - {t("footer.copyright")}
    </div>
  )
}

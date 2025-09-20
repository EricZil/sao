'use client';

import { useState, useEffect } from "react";

export default function CommitInfo() {
  const [commitInfo, setCommitInfo] = useState("getting build...");

  useEffect(() => {
    fetch('https://api.github.com/repos/EricZil/sao/commits/main')
      .then(res => res.json())
      .then(data => {
        const shortHash = data.sha.substring(0, 7);
        setCommitInfo(`build: ${shortHash}`);
      })
      .catch(() => setCommitInfo("offline"));
  }, []);

  return (
    <p className="text-gray-600 font-mono text-xs">
      {commitInfo}
    </p>
  );
}
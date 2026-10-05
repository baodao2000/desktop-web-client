/**
 * So sánh 2 phiên bản semantic (ví dụ '1.0.3' và '1.0.2')
 * Trả về 1 nếu v1 > v2, -1 nếu v1 < v2, 0 nếu bằng nhau.
 */
export function compareSemver(v1: string, v2: string): number {
  const clean1 = v1.replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0)
  const clean2 = v2.replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0)

  const maxLength = Math.max(clean1.length, clean2.length)
  for (let i = 0; i < maxLength; i++) {
    const num1 = clean1[i] || 0
    const num2 = clean2[i] || 0
    if (num1 > num2) return 1
    if (num1 < num2) return -1
  }
  return 0
}

export interface ReleaseInfo {
  hasUpdate: boolean
  latestVersion: string
  releaseName: string
  releaseNotes: string
  publishedAt: string
  downloadUrl: string
}

/**
 * Kiểm tra phiên bản mới từ GitHub Releases API công khai
 */
export async function checkGitHubUpdate(
  currentVersion: string,
  repo: string = 'baodao2000/desktop-web-client'
): Promise<ReleaseInfo | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!res.ok) {
      return null
    }

    const data = await res.json()
    const latestVersion = (data.tag_name || '').replace(/^v/, '')
    const isNewer = compareSemver(latestVersion, currentVersion) > 0

    // Xác định hệ điều hành để đưa link tải phù hợp
    const isMac = typeof window !== 'undefined' && window.electronAPI?.platform === 'darwin'
    const fileName = isMac ? 'DesktopWebClient-Mac.dmg' : 'DesktopWebClient-Setup.exe'
    const downloadUrl = `https://github.com/${repo}/releases/latest/download/${fileName}`

    return {
      hasUpdate: isNewer,
      latestVersion,
      releaseName: data.name || data.tag_name,
      releaseNotes: data.body || '',
      publishedAt: data.published_at || '',
      downloadUrl,
    }
  } catch (err) {
    console.warn('Không thể kiểm tra bản cập nhật:', err)
    return null
  }
}

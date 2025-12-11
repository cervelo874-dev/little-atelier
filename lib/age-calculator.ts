export function calculateAge(birthDateStr: string, targetDateStr: string): string {
    if (!birthDateStr || !targetDateStr) return ""

    const birthDate = new Date(birthDateStr)
    const targetDate = new Date(targetDateStr)

    let years = targetDate.getFullYear() - birthDate.getFullYear()
    let months = targetDate.getMonth() - birthDate.getMonth()

    if (months < 0) {
        years--
        months += 12
    }

    if (years < 0) return "Not born yet"

    // Japanese format support if needed, but returning generic string for now
    // User asked for Japanese? "X歳Yヶ月"
    return `${years}歳 ${months}ヶ月`
}

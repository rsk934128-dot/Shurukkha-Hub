
/**
 * @fileOverview Deep Packet Inspection (DPI) Module.
 * Analyzes request payloads for malicious patterns.
 */

export const Inspector = {
  /**
   * Scans a payload for suspicious patterns.
   */
  scanPayload: (payload: any): { isMalicious: boolean; reason?: string } => {
    const dataString = JSON.stringify(payload).toLowerCase();

    // Pattern 1: SQL Injection
    const sqlPatterns = ["drop table", "union select", "insert into", "delete from", "--", "select * from"];
    for (const pattern of sqlPatterns) {
      if (dataString.includes(pattern)) {
        return { isMalicious: true, reason: `SQL_INJECTION_PATTERN: ${pattern}` };
      }
    }

    // Pattern 2: XSS
    const xssPatterns = ["<script>", "javascript:", "onerror=", "alert(", "eval("];
    for (const pattern of xssPatterns) {
      if (dataString.includes(pattern)) {
        return { isMalicious: true, reason: `XSS_PATTERN: ${pattern}` };
      }
    }

    // Pattern 3: Suspicious Hex/Encodings
    const hexPattern = /\\x[0-9a-f]{2}/i;
    if (hexPattern.test(dataString)) {
      return { isMalicious: true, reason: "SUSPICIOUS_HEX_ENCODING" };
    }

    return { isMalicious: false };
  }
};

/* El Secuestro de Maxim — shared config.
   SPREADSHEET_ID: fill in once the game sheet exists and is shared with the
   service account (see .claude/skills/gsheet-service-account). */
const ESC_CONFIG = {
  PASSWORD: 'maxim',
  CREDENTIALS_FILE: '../escaperoom_credentials.hex',
  SPREADSHEET_ID: '1TtUoVFoDkGY-ep2lLPChw41vAb1UwDwDtfVFBXd_gRk',
  POLL_MS: 4000,

  STATE_RANGE: 'state!A2:B17',
  /* Row numbers inside the `state` tab (column B holds the value). */
  STATE_ROWS: {
    happiness_level: 2,
    happiness_anchor_ts: 3,
    happiness_mode: 4,       /* normal | hold_critical | flatline | paused */
    happiness_rate: 5,       /* points per minute */
    grindr_backstory: 6,     /* hidden | revealed */
    tenfa_current: 7,        /* factor index, written by the 10FA app */
    tenfa_pending: 8,        /* factor id awaiting Billy, or '' */
    tenfa_answer: 9,         /* what Fede submitted, shown on the console */
    tenfa_verdict: 10,       /* approve:<id>:<nonce> | reject:<id>:<nonce> */
    tenfa_complete: 11,      /* 0 | 1 */
    cctv_mode: 12,           /* idle | running | paused | failure | getaway */
    cctv_frame: 13,          /* 0-9 */
    cctv_frame_ts: 14,       /* epoch ms when current frame started */
    cctv_interval_s: 15,     /* seconds per frame */
    call_requested: 16,      /* timestamp → the laptop daemon fires the Bland call */
    tenfa_cmd: 17,           /* console→bank command: skip:<n> | complete:<n> | reset:<n> */
  },
};

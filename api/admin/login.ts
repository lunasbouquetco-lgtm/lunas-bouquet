import { checkPassword, type Req, type Res } from '../_admin'

// The password screen posts here once. There's no session to create — every later
// request re-sends the password header and is re-checked — so this just answers
// "would that password work?" and lets the UI show a useful error.
export default async function handler(req: Req, res: Res) {
  if (checkPassword(req)) {
    res.status(200).json({ ok: true })
    return
  }
  res.status(401).json({ ok: false, error: 'That password is not right.' })
}

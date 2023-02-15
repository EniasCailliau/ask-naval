import { type NextRequest, NextResponse } from 'next/server'
import { getSteamshipPackage } from '@steamship/steamship-nextjs'


export default async function handler(req: NextRequest, res: NextResponse) {
  const { bio, vibe } = req.body as any;

  // Fetch a stub to the Steamship-hosted backend.
  // Use a different workspace name per-user to provide data isolation.
  const pkg = await getSteamshipPackage({
    workspace: 'use-unique-workspace-handle-per-user', 
    pkg: process.env.STEAMSHIP_PACKAGE_HANDLE as string
  })

  try {
    // Invoke a method on the package defined in steamship/api.py. Full syntax: pkg.invoke("method", {args}, "POST" | "GET")
    const resp = await pkg.invoke('generate', {bio, vibe})

    // The resp object is an Axios response object. The .data field can be binary, JSON, text, etc.
    // For example, it's just text -- see steamship/api.py for where it's produced and returned.
    const bios = resp.data

    // Return JSON to the web client.
    // @ts-ignore
    return res.json({ bios })
  } catch (ex) {
    // @ts-ignore
    return res.json({ text: "There was an error responding to you." })
  }
}


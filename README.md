# Cytrix Site

Interactive showcase website for the [Cytrix Security Engine](https://github.com/ninemaxpro/cytrix-engine) — a cloud-native security aggregation and intelligence platform built on AWS.

## What This Is

A portfolio site that lets hiring managers, recruiters, and the security community explore what Cytrix does — without cloning a repo or running a CLI.

**Live:** [Coming soon — deploying to Vercel]

## Sections

| Section | Description |
|---------|-------------|
| **Hero** | Animated pipeline visualization (EventBridge → Collector → Enrichment → Scorer → Correlator → CLI) |
| **Application Flow** | Five-stage product story: Ingest → Enrich → Score → Correlate → Remediate |
| **Interactive Architecture** | Draggable React Flow diagram showing all Lambdas, S3 prefixes, and data flow |
| **Terminal Demo** | Simulated CLI session showing real Cytrix output (findings dashboard, attack stories) |
| **Feature Cards** | Six capabilities: multi-scanner ingestion, weighted scoring, threat intel, correlation, guardrails, inventory |
| **Tech Stack** | Full technology grid: Python, Terraform, 8 AWS services, security tools, frameworks |
| **Design Decisions** | Accordion explaining the "why" behind architectural choices |
| **Feedback CTA** | Google Form + GitHub Discussions link for community input |

## Tech Stack

- **Next.js 16** (App Router, static export)
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** — scroll animations, transitions
- **React Flow** (@xyflow/react) — interactive architecture diagram
- **Vercel Analytics** — visitor tracking, referrer data, UTM support

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # Static export to out/
```

## Deployment

Deployed on Vercel. Push to `main` triggers automatic deployment.

### UTM Tracking

Share with UTM params for source attribution:

```
https://cytrix-site.vercel.app/?utm_source=linkedin&utm_medium=post&utm_campaign=cytrix-launch
```

Vercel Analytics captures referrer, UTM source, and page views automatically.

## TODO

- [ ] Create Google Form and replace placeholder links
- [ ] Deploy to Vercel
- [ ] Custom domain (optional)
- [ ] Add OG image for LinkedIn preview card
- [ ] Add asciinema recording as alternative to simulated demo

## Related

- [cytrix-engine](https://github.com/ninemaxpro/cytrix-engine) — The security platform itself

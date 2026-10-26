# GradeBox

**GradeBox helps teachers answer one question the moment they open it: "What should I grade next?"**

Teachers juggle several classes and assessments at once, and students expect their grades back by a promised date. GradeBox ranks unfinished assessments by that promised return date and by how much grading is left, and it estimates how long the remaining grading will take.

- **Live site:** `https://grade-box-five.vercel.app/`
- **Code:** `https://grade-box-five.vercel.app/`

Built for the Moondev coding challenge in seven days, with Next.js, TypeScript, Tailwind CSS and Supabase.

---

## What it does

**For every teacher (Free plan)**

- Sign up, log in and log out with email and password.
- Create, rename and delete classes.
- Create, edit and delete assessments. Each one stores a title, a class, a **due date** (when students hand work in), a **promised return date** (when students expect grades back), the expected number of submissions, and the estimated minutes to grade one submission.
- Track grading progress: graded vs expected, remaining, percentage and a progress bar.
- A dashboard that lists unfinished assessments in priority order, labelled **Overdue**, **Due soon** or **Upcoming**, with totals for active assessments, remaining submissions and estimated time left.
- Limits: up to **2 classes** and **5 active assessments**.

**Pro plan (demo upgrade)**

- Unlimited classes and active assessments.
- A **weekly workload forecast**: total estimated time for the week, workload per promised return date, overdue work shown separately, and the assessments with the most work remaining.

> The Pro upgrade is a clearly labelled **demo**. No payment is taken.

---

## Tech stack

| Part | Choice |
|---|---|
| Framework | Next.js (App Router) with React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database and auth | Supabase (PostgreSQL, Supabase Auth, Row Level Security) |
| Supabase packages | `@supabase/supabase-js`, `@supabase/ssr` (the only dependencies added beyond the Next.js starter) |
| Hosting | Vercel |

---

## How the main logic works

All calculations live in small, pure functions in `lib/` with no React and no database code, so the dashboard, the Assessments page and the forecast always agree.

### Progress (`lib/grading.ts`)

- `remaining = max(0, expected - graded)`
- `percent = floor(graded / expected x 100)`, capped at 100. It uses `floor`, not `round`, so 249 of 250 shows 99% and never a misleading 100%.
- **Complete** means `expected > 0` and `graded >= expected`. Complete assessments are excluded from the grading queue and from workload totals.
- **Expected = 0** shows "No submissions expected yet" instead of dividing by zero.
- **Graded > expected** is stored as entered, the bar is capped at 100%, and an amber warning flags the mismatch instead of hiding it.
- **Editing details never touches the graded count.** If the expected number rises or falls, existing progress is preserved.

### Priority (`prioritizeAssessments`)

1. **Overdue:** promised return date is before today and the assessment is unfinished.
2. **Due soon:** return date is today or within the next 3 days.
3. **Upcoming:** anything later.

Within the same status, the earlier return date comes first. If the dates tie, the assessment with more remaining minutes comes first. Completed assessments never appear. "Today" is calculated once per request and passed into the functions, so results are deterministic and testable.

### Workload

`remaining minutes = remaining submissions x minutes per submission`, shown as hours and minutes. These are **estimates from the teacher's own numbers**, not measured grading time, and the interface says so.

### Weekly forecast (`lib/forecast.ts`)

- "This week" is a **rolling 7 days**: today plus the next 6 days.
- Work is grouped by promised return date, one row per day.
- **Overdue** work is shown in its own section and **included** in the weekly total, because it still has to be done.
- Assessments with return dates **after** the 7 days are not in the total. They appear as one summary line.
- Completed and zero-expected assessments contribute nothing.
- "Most work remaining" lists the three assessments with the most remaining minutes in overdue plus this week.

---

## Key decisions and tradeoffs

**Two separate dates.** The due date and the promised return date are different things and are stored separately. The promised return date drives urgency. The database requires the return date to be on or after the due date.

**Database-enforced limits.** Free-plan limits are enforced by database triggers, not only by hiding buttons. A hidden button stops no one who calls the database API directly. The app translates the database's refusal into a friendly message with an upgrade link.

**"Active" assessment = not complete.** Finishing an assessment frees a slot. The trigger also runs on updates, so raising the expected count on a finished assessment (which would quietly reopen it) is refused when the user is at the limit. Editing an assessment that was already active is always allowed. Downgrading never deletes data. Someone over the limit simply cannot add more.

**Deleting a class deletes its assessments** (`on delete cascade`). The class delete button shows how many assessments will go with it before the teacher confirms.

**Demo upgrade through a database function.** `demo_set_plan` lets a signed-in user change their own plan. This avoids using Supabase's secret `service_role` key anywhere in the app. Users have **no write access** to the `profiles` table, so they cannot change their plan through the API.

**Hiding vs enforcing.** Hiding a feature in the interface is only decoration. Enforcement happens where the user cannot interfere: in the database (limits, ownership) and in server code that checks the plan before loading Pro data.

---

## Security model

- **The Supabase URL and publishable key are public by design.** They are in the browser bundle and anyone can read them. Data is protected by **Row Level Security**, not by hiding the key.
- **The `service_role` key is never used** and appears nowhere in the code or in environment variables.
- **Row Level Security is on for every table.** Policies require `user_id = auth.uid()` for reading, inserting, updating and deleting. `user_id` fills in automatically on insert and cannot be spoofed.
- **An assessment can only point to a class the user owns**, enforced in the insert and update policies.
- **Anonymous visitors have no table access.** Grants go to the `authenticated` role only.
- **Plans are read-only to users.** `profiles` has a select policy and no insert or update policy.
- **Pages are protected twice.** `proxy.ts` redirects signed-out visitors to `/login` and checks the session with `getUser()`, which verifies with Supabase instead of trusting a cookie. Pages and server actions also check the user themselves.
- **The Pro forecast checks the plan on the server before querying any forecast data.** Free users get an upgrade card.
- **Login errors are deliberately vague** ("Invalid email or password"), so the form does not reveal which emails have accounts. Sign-up uses a neutral message for the same reason.

---

## Project structure

```
app/
  page.tsx                  Dashboard ("What should I grade next?")
  login/                    Sign up, log in (server actions)
  classes/                  Class list, add, rename, delete
  assessments/              Assessment list, add, edit, progress, delete
  forecast/                 Pro weekly forecast (plan checked on the server)
  settings/                 Account, plan, usage, demo upgrade
components/                 UI pieces (sidebar shell, cards, forms, notices)
lib/
  grading.ts                Progress, remaining work, priority, formatting
  forecast.ts               Weekly forecast calculation
  plan.ts                   Plan lookup, free limits, limit messages
  assessment-validation.ts  Shared create/edit validation
  supabase/                 Browser and server Supabase clients
proxy.ts                    Redirects signed-out visitors to /login
supabase/schema.sql         Tables, RLS policies, limits, demo upgrade function
```

---

## Testing

Everything was tested by hand, on the local build and on the deployed site.

| Area | What was checked | Result |
|---|---|---|
| Auth | Sign up with email confirmation, sign in, wrong password message, unconfirmed-email message, sign out | Pass |
| Protected pages | Signed-out visits to app pages redirect to `/login`; signed-in visit to `/login` redirects to the dashboard | Pass |
| Data isolation | A second account sees none of the first account's classes or assessments | Pass |
| Classes | Create, rename, delete with confirmation, empty state | Pass |
| Assessments | Create, edit, delete, validation (return date before due date, number ranges) | Pass |
| Progress edge cases | 18 of 25 gives 72% and 7 left; all graded gives Complete; graded above expected caps at 100% with a warning; zero expected shows "not yet applicable"; changing the expected count keeps graded unchanged | Pass |
| Dashboard | Order follows overdue, due soon, upcoming, then remaining minutes; completed items leave the queue; totals match hand calculations; empty and all-caught-up states | Pass |
| Free limits | Third class refused; sixth active assessment refused; finishing one frees a slot; reopening a finished assessment at the limit refused; independent per account | Pass |
| Limit messages | Friendly notice with upgrade link for each limit case | Pass |
| Plan switching | Demo upgrade and downgrade; over-limit note after downgrading; nothing deleted | Pass |
| Pro forecast | Totals, overdue section, per-day grouping, later-dates line, matched hand calculations; locked for Free users, including direct URL access; live site | Pass |
| Production build and lint | `npm run build` and `npm run lint` with no errors | Pass |
| Responsive | Phone (375 px), tablet (768 px), laptop (1440 px) and wide (1920 px) layouts | Pass |
| Live two-account check | On the deployed site, each account sees only its own data and Free cannot see the forecast | Pass |
| Direct database tests | In the SQL Editor, as a signed-in role: B reads zero of A's assessments; a free user is refused a third class; updating `profiles.plan` is denied; attaching an assessment to another user's class is refused | Pass |

---

## Known limitations

- **No password reset.** A forgot-password flow is the next improvement.
- **"Today" uses the server's UTC date.** Around local midnight, a teacher in a different time zone may see urgency labels a few hours off. A per-user time zone setting would fix this.
- **The Pro upgrade is a demo.** It takes no payment, and any signed-in user can switch their own plan. A real version would remove the self-service function and let a payment provider's webhook set the plan.
- **Per-submission tracking is not supported.** GradeBox counts graded papers but does not record which ones.
- **Workload figures are estimates** from the teacher's own per-paper minutes. GradeBox does not measure real grading time.
---

## How AI was used

I used Claude as a tutor while building this: one small feature at a time, with each decision explained before it was written and each step tested by hand before moving on.
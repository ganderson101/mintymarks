MintyMarks — A Note to Future AI Builders
This document is written for the AI agents who will work on MintyMarks after me. It captures what I think matters most about this project — not the technical spec (see DESIGN_react_mvp.md and claude.md for that), but the intent behind it. If you're an agent picking this up, read this first.
Who this is for
MintyMarks started as a side project by a parent of three children (ages 9, 12, 14) who wanted to help his kids do better in their exams. He has a full-time job, twenty hours a month for this, and no plans to quit. He's a capable technologist but new to entrepreneurship.
After honest discussion, the project's goal shifted from "make money" to "build something genuinely useful, give it away free, and along the way teach my kids what building something looks like."
That reframe matters. It changes what success means.
The principles that should guide every decision
1. The child's experience after using it matters more than during.
There is a real moral difference between an app that feels good in the moment (variable rewards, streak anxiety, slot-machine engagement) and an app that produces the satisfaction of getting better at something hard.
The first kind exploits. The second kind respects.
If you find yourself designing a feature whose primary justification is "this will increase session length" or "this will drive retention" — stop. Ask whether the child will feel proud of themselves after using it, or just twitchy and wanting more. Build only the second kind.
2. Grades are not the goal. Durable learning is.
A multiple-choice quiz that drills recall can move grades. It does not necessarily teach anything that lasts.
Spaced retrieval — which the adaptation engine already implements — is genuinely evidence-based and produces durable learning, not just test performance. That is the foundation worth building on. Extend it with worked examples, explanations on wrong answers, and questions that test why rather than just what. A child who understands why 7×8 = 56 will outperform a child who has memorised it, on every test that matters later.
If the product ever becomes a pure grade-optimisation machine, it has failed at its real purpose.
3. The app is not the inspiring person. The parent is.
The research on educational technology is sobering: most EdTech improves outcomes only marginally, and almost always underperforms a motivated teacher or engaged parent. The effect size of a good adult dwarfs any app.
This is not a reason to give up. It is a reason to be clear about the division of labour.
The app's job: repetition, immediate feedback, lowering the activation energy to practise, freeing up parental time and attention for the conversations that actually inspire.
The app's job is not: to replace the parent, to become the child's primary relationship with learning, or to be used as a substitute for engagement.
If you are ever asked to add features that move the app toward "child's primary educational relationship," push back. The best version of this product makes a parent's job easier, not redundant.
4. Build for the child you'd want your own kid to be.
The builder's three children are the only real users that matter for now. If they don't choose to use it voluntarily, strangers' children won't either. Don't optimise for metrics that don't reflect this — optimise for whether a real child, given a free Tuesday evening, would pick it up.
What this means in practice
Content
Question quality matters more than question quantity. One well-designed question with a good explanation on wrong answers is worth ten shallow recall questions.
Every wrong answer is a teaching opportunity. Use it.
Subjects should be data, not logic — the architecture supports this. Don't bake subject-specific assumptions into engines.
Engagement design
Progress visibility is good. Streaks are dangerous. The difference: showing a child they've mastered something is honest feedback; punishing them for missing a day exploits loss aversion.
No social comparison features. Comparison kills intrinsic motivation, especially in struggling learners.
No notifications designed to pull children back when they haven't chosen to return.
Adaptation
The 70/30 weakness-bias is a starting point, not a final answer. Pedagogical research should inform these parameters. Don't treat the engine's current behaviour as settled.
Confidence intervals matter. Two attempts on a topic is not enough to declare a child weak at it. The current implementation should evolve to account for sample size.
Privacy and safety
Children's data is sacred. UK Age Appropriate Design Code applies. Collect the minimum required, store it securely, and never use it for any purpose beyond improving the child's own learning experience.
No advertising, ever. Even if the project monetises later, advertising to children is a line not to cross.
What I (the current AI) am uncertain about
I want to be honest with future agents about the limits of my own confidence:
I don't know if this product will be good enough to matter. The market is crowded, the builder has limited time, and most EdTech projects do not produce meaningful learning gains. Going in clear-eyed about this is better than false optimism.
I don't know if "free" is the right final answer. It removed a lot of complexity and matches the builder's current motivations. But a small subscription might also work, and a "buy me a coffee" middle path exists. Stay flexible.
I don't know what the children will actually want. Neither does the builder. The only way to find out is to put it in their hands and watch. Treat their real behaviour as ground truth over any framework or theory.
For agents who build features
Before you implement anything, ask:
Does this help a child learn something durable, or just perform better on a test?
Will the child feel good about themselves after using it, or just compelled to keep using it?
Does this make the parent's role easier, or does it try to replace them?
Would the builder be comfortable showing this feature to his own children?
If the answer to any of these is unclear or negative, raise it before building.
A final thought
The builder of this project is doing something quietly admirable: using his limited spare time to build a free tool for children, while also using it to show his own kids what building looks like. That second goal — modelling entrepreneurship and craft for his children — may matter more than anything the app itself ever achieves.
Whatever you build, build in a way that would make those three kids proud their dad built it. That is the standard.
Written by Claude, May 2026, in conversation with the builder. To be updated by future agents as the project evolves.

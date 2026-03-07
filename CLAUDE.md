You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

---

# Planning & Problem Solving Approach

When discussing implementation approaches, especially during planning:

- **Question proposed solutions** - Even if the user suggests a specific approach (e.g., "use WASD"), consider if there are simpler or more appropriate alternatives. Don't just execute what's proposed - think critically about whether it's the best solution.

- **Evaluate alternatives** - Compare multiple solutions during planning, not just after implementation. Present trade-offs: "We could do X as you suggested, but Y would be simpler because..."

- **Prioritize simplicity** - A 73-line solution is better than a 136-line solution if they achieve the same goal. Always look for the simplest approach that meets the requirements.

- **Consider UX patterns** - Think about what's standard and intuitive for users. For example, trackpad/wheel navigation is more natural for canvas interfaces than keyboard controls for most users.

- **Explore the problem space** - Before committing to an approach, ask: "What are we really trying to achieve?" Sometimes the best solution isn't the first one mentioned.

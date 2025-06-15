// This file is kept for backward compatibility
// The actual interfaces and implementations have been moved to:
// - src/lib/ai/providers/interface.ts (AIProvider interface)
// - src/lib/ai/providers/mock.ts (MockAIProvider)
// - src/lib/ai/responseParser.ts (parseAIResponse function)
// - src/lib/ai/providers/factory.ts (createAIProvider function)

export {AIProvider} from './providers/interface';
export {MockAIProvider} from './providers/mock';
export {parseAIResponse} from './responseParser';
export {createAIProvider} from './providers/factory';

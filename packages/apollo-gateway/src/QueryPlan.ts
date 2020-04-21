import {
  FragmentDefinitionNode,
  GraphQLSchema,
  OperationDefinitionNode,
  SelectionSetNode,
  VariableDefinitionNode,
} from 'graphql';
import { astSerializer, queryPlanSerializer } from './snapshotSerializers';
import prettyFormat from 'pretty-format';
import { InMemoryLRUCache } from 'apollo-server-caching/src';

export type ResponsePath = (string | number)[];

export type FragmentMap = { [fragmentName: string]: FragmentDefinitionNode };

export interface QueryPlan {
  kind: 'QueryPlan';
  node?: PlanNode;
}

export type OperationContext = {
  schema: GraphQLSchema;
  operation: OperationDefinitionNode;
  fragments: FragmentMap;
  printedOperationStore?: InMemoryLRUCache<string>;
};

export type PlanNode = SequenceNode | ParallelNode | FetchNode | FlattenNode;

export interface SequenceNode {
  kind: 'Sequence';
  nodes: PlanNode[];
}

export interface ParallelNode {
  kind: 'Parallel';
  nodes: PlanNode[];
}

export interface FetchNode {
  kind: 'Fetch';
  serviceName: string;
  selectionSet: SelectionSetNode;
  variableUsages?: { [name: string]: VariableDefinitionNode };
  requires?: SelectionSetNode;
  internalFragments: Set<FragmentDefinitionNode>;
}
export interface FlattenNode {
  kind: 'Flatten';
  path: ResponsePath;
  node: PlanNode;
}

export function serializeQueryPlan(queryPlan: QueryPlan) {
  return prettyFormat(queryPlan, {
    plugins: [queryPlanSerializer, astSerializer],
  });
}

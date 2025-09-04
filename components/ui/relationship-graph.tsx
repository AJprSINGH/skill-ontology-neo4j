"use client";

import { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { RelationshipNode, RelationshipEdge } from '@/types';

interface RelationshipGraphProps {
  entityType: string;
  entityId: string;
  relationships: any;
  isLoading: boolean;
}

export function RelationshipGraph({
  entityType,
  entityId,
  relationships,
  isLoading
}: RelationshipGraphProps) {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);

  useEffect(() => {
    if (!networkRef.current || isLoading || !relationships) return;

    // Transform relationships data to vis-network format
    const nodes = new DataSet<RelationshipNode>([
      {
        id: entityId,
        label: relationships.entity?.title || entityId,
        color: '#3B82F6',
        font: { color: '#FFFFFF' },
        borderWidth: 2,
        borderColor: '#1D4ED8'
      },
      ...(relationships.connected_entities || []).map((entity: any, index: number) => ({
        id: entity.id,
        label: entity.title,
        color: getNodeColor(entity.type),
        font: { color: '#374151' },
        borderWidth: 1,
        borderColor: '#D1D5DB'
      }))
    ]);

    const edges = new DataSet<RelationshipEdge & { id: string }>(
      (relationships.relationships || []).map((rel: any) => ({
        from: rel.from_id,
        to: rel.to_id,
        label: rel.type,
        arrows: 'to',
        color: '#6B7280'
      }))
    );

    const data = { nodes, edges };

    const options = {
      nodes: {
        shape: 'dot',
        size: 16,
        font: {
          size: 12,
          color: '#374151'
        },
        borderWidth: 1,
        shadow: true
      },
      edges: {
        width: 1,
        color: { inherit: 'from' },
        smooth: {
          type: 'continuous'
        },
        font: {
          size: 10,
          color: '#6B7280'
        }
      },
      physics: {
        enabled: true,
        stabilization: { iterations: 100 }
      },
      interaction: {
        hover: true,
        tooltipDelay: 200
      }
    };

    networkInstance.current = new Network(networkRef.current, data);

    return () => {
      networkInstance.current?.destroy();
    };
  }, [entityId, relationships, isLoading]);

  const getNodeColor = (type: string) => {
    const colors = {
      industry: '#3B82F6',
      department: '#14B8A6',
      jobrole: '#F59E0B',
      skill: '#8B5CF6',
      classification: '#EF4444',
      cwf: '#06B6D4'
    };
    return colors[type as keyof typeof colors] || '#6B7280';
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!relationships || !relationships.connected_entities?.length) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V7M9 21H5a2 2 0 01-2-2V7m0 0h18" />
            </svg>
          </div>
          <p>No relationships found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full border border-gray-200 rounded-lg overflow-hidden">
      <div ref={networkRef} className="h-full w-full" />
    </div>
  );
}

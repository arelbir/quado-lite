'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/shared/icons';
import { useWorkflowStore } from '../Hooks/useWorkflowStore';
import { workflowTemplates, workflowTemplateCategories } from '@/features/workflows/lib/workflow-templates';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export function WorkflowTemplatesPanel() {
  const { setNodes, setEdges, reset } = useWorkflowStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLoadTemplate = (templateId: string) => {
    const template = workflowTemplates.find(t => t.id === templateId);
    if (!template) return;

    // Reset current workflow
    reset();

    // Generate unique IDs for nodes and edges
    const nodeIdMap = new Map<string, string>();
    
    const nodes = template.nodes.map((node, index) => {
      const id = `${node.type}-${Date.now()}-${index}`;
      const sourceId = `${node.type}-${index}`;
      nodeIdMap.set(sourceId, id);
      
      return {
        ...node,
        id,
      };
    });

    const edges = template.edges.map((edge, index) => {
      const sourceId = nodeIdMap.get(edge.source) || edge.source;
      const targetId = nodeIdMap.get(edge.target) || edge.target;
      
      return {
        ...edge,
        id: `edge-${Date.now()}-${index}`,
        source: sourceId,
        target: targetId,
      };
    });

    setNodes(nodes);
    setEdges(edges);
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" size="sm">
          <Icons.FileText className="size-4 mr-2" />
          Load Workflow Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Workflow Templates</DialogTitle>
          <DialogDescription>
            Choose a pre-built workflow template to get started quickly
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {workflowTemplateCategories.map((category) => {
              const categoryTemplates = workflowTemplates.filter(t => t.category === category.id);
              const IconComponent = (Icons as any)[category.icon] || Icons.File;
              
              return (
                <div key={category.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {IconComponent && <IconComponent className="size-4" />}
                    <h3 className="font-semibold">{category.label}</h3>
                    <Badge variant="secondary" className="ml-auto">
                      {categoryTemplates.length}
                    </Badge>
                  </div>
                  
                  <div className="grid gap-3">
                    {categoryTemplates.map((template) => {
                      const TemplateIcon = (Icons as any)[template.icon] || Icons.File;
                      
                      return (
                        <Card 
                          key={template.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                {typeof TemplateIcon === 'function' && <TemplateIcon className="size-5 text-muted-foreground" />}
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-semibold">{template.name}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {template.description}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    {typeof IconComponent === 'function' && <IconComponent className="size-6" />}
                                    <span>{template.nodes.length} nodes</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Icons.Clock className="size-3" />
                                    <span>{template.estimatedDuration}</span>
                                  </div>
                                  {template.defaultModule && (
                                    <Badge variant="outline" className="text-xs">
                                      {template.defaultModule}
                                    </Badge>
                                  )}
                                </div>
                                
                                <Button
                                  size="sm"
                                  className="w-full mt-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLoadTemplate(template.id);
                                  }}
                                >
                                  <Icons.FileText className="size-4 mr-2" />
                                  Load Template
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  
                  {category.id !== 'standard' && <Separator className="my-4" />}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

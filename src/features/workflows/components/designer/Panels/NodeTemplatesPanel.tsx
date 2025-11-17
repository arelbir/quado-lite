'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/shared/icons';
import { useWorkflowStore } from '../Hooks/useWorkflowStore';
import { nodeTemplates, templateCategories, getTemplatesByCategory } from '@/features/workflows/lib/node-templates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

export function NodeTemplatesPanel() {
  const addNode = useWorkflowStore((state) => state.addNode);
  const nodes = useWorkflowStore((state) => state.nodes);
  const [selectedCategory, setSelectedCategory] = useState<'basic' | 'approval' | 'review' | 'conditional'>('basic');

  const handleAddTemplate = (templateId: string) => {
    const template = nodeTemplates.find(t => t.id === templateId);
    if (!template) return;

    const nodeId = `${template.type}-${Date.now()}`;
    const newNode = {
      id: nodeId,
      type: template.type,
      position: { 
        x: 300 + nodes.length * 50, 
        y: 150 + nodes.length * 50 
      },
      data: { ...template.defaultData },
    };

    addNode(newNode);
  };

  const onDragStart = (event: React.DragEvent, templateId: string) => {
    const template = nodeTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    event.dataTransfer.setData('application/reactflow', template.type);
    event.dataTransfer.setData('templateId', templateId);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Node Templates</CardTitle>
        <CardDescription className="text-xs">
          Pre-configured nodes for quick workflow building
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={selectedCategory} onValueChange={(v: any) => setSelectedCategory(v)} className="w-full">
          <div className="px-4 pb-2">
            <TabsList className="grid w-full grid-cols-2 h-auto">
              {templateCategories.map(cat => (
                <TabsTrigger 
                  key={cat.id} 
                  value={cat.id}
                  className="text-xs py-1.5"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {templateCategories.map(category => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              <ScrollArea className="h-[400px] px-4">
                <div className="space-y-2 pb-4">
                  {getTemplatesByCategory(category.id as any).map(template => {
                    const IconComponent = Icons[template.icon as keyof typeof Icons] as any;
                    
                    return (
                      <div
                        key={template.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, template.id)}
                        className="cursor-move"
                      >
                        <Card className="hover:bg-accent transition-colors border-2">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                              <div className="mt-0.5">
                                {IconComponent && <IconComponent className={`size-4 ${template.color}`} />}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-semibold">{template.name}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {template.type}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {template.description}
                                </p>
                                <div className="flex items-center gap-2 pt-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => handleAddTemplate(template.id)}
                                  >
                                    <Icons.Plus className="size-3 mr-1" />
                                    Add
                                  </Button>
                                  {template.defaultData.deadlineHours && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Icons.Clock className="size-3" />
                                      {template.defaultData.deadlineHours}h
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

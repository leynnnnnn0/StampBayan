import ModuleHeading from "@/components/module-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

import StampShape from '@/components/card-template/stamp-shape';
import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { Plus, Edit, Trash2, Eye, Sparkles, Award, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { CardTemplate, CardTemplatePerk } from '@/types';

interface IndexProps {
  cardTemplates?: CardTemplate[];
}

export default function Index({ cardTemplates = [] }: IndexProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);

  const handleEdit = (id: number) => {
    router.visit(`/business/card-templates/${id}/edit`);
  };

  const handleDelete = (id: number) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      router.delete(`/business/card-templates/${templateToDelete}`, {
        onSuccess: () => {
          toast.success("Deleted Successfully.");
        },
        onError: (e) => {
          if(e.error){
            toast.error(e.error);
          }else {
            toast.error("An error occured.")
          }
        }
      });
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  const handleView = (id: number) => {
    router.visit(`/business/card-templates/${id}`);
  };

  const getPerkForStamp = (perks: CardTemplatePerk[], stampNumber: number) => {
    return perks.find(p => p.stampNumber === stampNumber);
  };

  return (
      <AppLayout>
          <Head title="Loyalty Cards" />
          <ModuleHeading
              title="Loyalty Cards"
              description="List of your loyalty cards"
          >
              <Button
                  onClick={() =>
                      router.visit('/business/card-templates/create')
                  }
              >
                  <Plus className="h-4 w-4" /> Create New Template
              </Button>
          </ModuleHeading>

          {/* Empty State */}
          {cardTemplates.length === 0 && (
              <Alert className="mt-8">
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                      No loyalty cards yet. Create your first loyalty card
                      template to get started!
                  </AlertDescription>
              </Alert>
          )}

          {/* Loyalty Cards Grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cardTemplates.map((template) => (
                  <Card
                      key={template.id}
                      className="overflow-hidden transition-shadow duration-300 hover:shadow-lg"
                  >
                      {/* Card Preview */}
                      <div
                          className="relative mt-0 h-64 p-6"
                          style={{
                              backgroundColor: template.backgroundColor,
                              backgroundImage: template.backgroundImage
                                  ? `url(/${template.backgroundImage})`
                                  : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                          }}
                      >
                          <div
                              className="h-full rounded-lg backdrop-blur-sm"
                              style={{
                                  backgroundColor: template.backgroundImage
                                      ? 'rgba(0,0,0,0.2)'
                                      : 'transparent',
                              }}
                          >
                              <div className="flex h-full flex-col p-4">
                                  {/* Logo */}
                                  {template.logo && (
                                      <div className="mb-2 flex justify-center">
                                          <img
                                              src={`/${template.logo}`}
                                              alt="Logo"
                                              className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-lg"
                                          />
                                      </div>
                                  )}

                                  {/* Heading */}
                                  <h3
                                      className="mb-1 text-center text-lg font-bold tracking-wide"
                                      style={{ color: template.textColor }}
                                  >
                                      {template.heading}
                                  </h3>

                                  {/* Subheading */}
                                  {template.subheading && (
                                      <p
                                          className="mb-3 text-center text-xs opacity-90"
                                          style={{ color: template.textColor }}
                                      >
                                          {template.subheading}
                                      </p>
                                  )}

                                  {/* Stamps Grid - Show first 10 stamps */}
                                  <div className="mb-3 grid flex-1 grid-cols-5 gap-1.5">
                                      {Array.from({
                                          length: Math.min(
                                              10,
                                              template.stampsNeeded,
                                          ),
                                      }).map((_, index) => {
                                          const stampNumber = index + 1;
                                          const perk = getPerkForStamp(
                                              template.perks || [],
                                              stampNumber,
                                          );
                                          const isFilled =
                                              index <
                                              Math.floor(
                                                  template.stampsNeeded * 0.6,
                                              );

                                          return (
                                              <div
                                                  key={index}
                                                  className="flex flex-col items-center"
                                              >
                                                  <div className="h-8 w-8">
                                                      <StampShape
                                                          shape={
                                                              template.stampShape
                                                          }
                                                          isFilled={isFilled}
                                                          isReward={!!perk}
                                                          rewardText={
                                                              perk?.reward
                                                          }
                                                          color={
                                                              perk
                                                                  ? perk.color
                                                                  : template.stampFilledColor
                                                          }
                                                          filledColor={
                                                              template.stampFilledColor
                                                          }
                                                          emptyColor={
                                                              template.stampEmptyColor
                                                          }
                                                          stampImage={
                                                              template.stampImage
                                                          }
                                                          details={
                                                              perk?.details
                                                          }
                                                          patternId={`index-stamp-${template.id}-${index}`}
                                                          sparkleSize={12}
                                                          rewardTextClassName="text-white font-bold text-[8px] text-center px-0.5 leading-tight drop-shadow-lg"
                                                      />
                                                  </div>
                                              </div>
                                          );
                                      })}
                                  </div>

                                  {/* Footer Info */}
                                  <div className="text-center">
                                      <p
                                          className="text-[10px] opacity-75"
                                          style={{ color: template.textColor }}
                                      >
                                          {template.footer || 'Loyalty Card'}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Card Info & Actions */}
                      <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                              <div className="flex-1">
                                  <CardTitle className="flex items-center gap-2 text-lg">
                                      {template.name}
                                      {template.perks &&
                                          template.perks.length > 0 && (
                                              <Badge className="bg-green-500 text-xs text-white">
                                                  <Award className="mr-1 h-3 w-3" />
                                                  {template.perks.length} Perks
                                              </Badge>
                                          )}
                                      {template.is_expired && (
                                          <div className="flex items-center gap-2">
                                              <TooltipProvider>
                                                  <Tooltip>
                                                      <TooltipTrigger asChild>
                                                          <Badge className="bg-red-500">
                                                              Expired{' '}
                                                              <Info className="h-4 w-4 cursor-help" />
                                                          </Badge>
                                                      </TooltipTrigger>
                                                      <TooltipContent>
                                                          <p>
                                                              Expired loyalty
                                                              card is not
                                                              visible to
                                                              customers
                                                          </p>
                                                      </TooltipContent>
                                                  </Tooltip>
                                              </TooltipProvider>
                                          </div>
                                      )}
                                  </CardTitle>
                                  <CardDescription className="mt-1">
                                      {template.stampsNeeded} stamps needed |
                                      Valid Until:{' '}
                                      {template.valid_until_formatted}
                                  </CardDescription>
                              </div>
                          </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                          {/* Mechanics Preview */}
                          <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                              {template.mechanics}
                          </p>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                              <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleView(template.id)}
                              >
                                  <Eye className="mr-1 h-4 w-4" />
                                  View
                              </Button>

                              <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleEdit(template.id)}
                              >
                                  <Edit className="mr-1 h-4 w-4" />
                                  Edit
                              </Button>
                              <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(template.id)}
                              >
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                      </CardContent>
                  </Card>
              ))}
          </div>

          {/* Delete Confirmation Dialog */}
          <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
          >
              <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          Delete Loyalty Card Template?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                          <span className="font-semibold text-gray-900">
                              Are you sure you want to delete this loyalty card
                              template?
                          </span>
                          <span>
                              Customers who are already using this loyalty card
                              might be shocked that it's gone. This action
                              cannot be undone and will affect all existing
                              customer cards using this template.
                          </span>
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel onClick={cancelDelete}>
                          Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                          onClick={confirmDelete}
                          className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                      >
                          Delete Template
                      </AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
      </AppLayout>
  );
}

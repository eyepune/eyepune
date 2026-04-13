import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Minus, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PackageCustomizer({ open, onOpenChange, basePackage, onCheckout, currency }) {
    const [selectedAddons, setSelectedAddons] = useState([]);

    const { data: addons = [] } = useQuery({
        queryKey: ['service-addons'],
        queryFn: () => base44.entities.ServiceAddon.filter({ is_active: true }),
        enabled: open
    });

    const compatibleAddons = addons.filter(addon => 
        !addon.compatible_with || 
        addon.compatible_with.length === 0 || 
        addon.compatible_with.includes(basePackage?.category)
    );

    const toggleAddon = (addon) => {
        setSelectedAddons(prev => {
            const exists = prev.find(a => a.id === addon.id);
            if (exists) {
                return prev.filter(a => a.id !== addon.id);
            }
            return [...prev, addon];
        });
    };

    const isSelected = (addonId) => selectedAddons.some(a => a.id === addonId);

    const basePrice = basePackage?.price || 0;
    const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    const totalPrice = basePrice + addonsTotal;

    const formatPrice = (price) => {
        const convertedPrice = price * (currency.rate || currency.conversionRate || 1);
        return `${currency.symbol}${convertedPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    };

    const handleProceed = () => {
        onCheckout({
            ...basePackage,
            selectedAddons,
            customPrice: totalPrice,
            customFeatures: [
                ...(basePackage.features || []),
                ...selectedAddons.map(a => `✨ ${a.name}`)
            ]
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                <DialogHeader className="px-6 pt-6 pb-4">
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-red-600" />
                        Customize Your Package
                    </DialogTitle>
                    <DialogDescription>
                        Start with {basePackage?.name} and add extra services to match your needs
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(90vh-200px)]">
                    <div className="px-6 pb-6 space-y-6">
                        {/* Base Package Summary */}
                        <Card className="border-2 border-red-200 dark:border-red-800">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg mb-2">{basePackage?.name}</h3>
                                        <p className="text-sm text-muted-foreground mb-3">Base Package</p>
                                        <div className="space-y-1">
                                            {basePackage?.features?.slice(0, 3).map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm">
                                                    <Check className="w-4 h-4 text-green-600" />
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-red-600">
                                            {formatPrice(basePrice)}
                                        </p>
                                        <Badge className="mt-2">Base</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Separator />

                        {/* Available Add-ons */}
                        <div>
                            <h3 className="font-bold text-lg mb-4">
                                Additional Services 
                                {compatibleAddons.length > 0 && (
                                    <span className="text-sm font-normal text-muted-foreground ml-2">
                                        ({compatibleAddons.length} available)
                                    </span>
                                )}
                            </h3>
                            {compatibleAddons.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {compatibleAddons.map((addon) => {
                                    const selected = isSelected(addon.id);
                                    return (
                                        <motion.div
                                            key={addon.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                        >
                                            <Card 
                                                className={`cursor-pointer transition-all hover:shadow-md ${
                                                    selected ? 'border-2 border-red-600' : 'border'
                                                }`}
                                                onClick={() => toggleAddon(addon)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-start gap-3">
                                                        <Checkbox 
                                                            checked={selected}
                                                            onCheckedChange={() => toggleAddon(addon)}
                                                            className="mt-1"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <h4 className="font-semibold">{addon.name}</h4>
                                                                <p className="font-bold text-red-600">
                                                                    +{formatPrice(addon.price)}
                                                                </p>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                {addon.description}
                                                            </p>
                                                            <Badge variant="outline" className="mt-2 text-xs">
                                                                {addon.category.replace('_', ' ')}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                                    <p className="mb-2">No additional services configured yet</p>
                                    <p className="text-sm">Contact us to discuss custom add-ons for your package</p>
                                </div>
                            )}
                        </div>

                        {/* Selected Add-ons Summary */}
                        <AnimatePresence>
                            {selectedAddons.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                >
                                    <Separator />
                                    <div className="bg-muted/50 rounded-lg p-4">
                                        <h4 className="font-semibold mb-3">Selected Add-ons:</h4>
                                        <div className="space-y-2">
                                            {selectedAddons.map((addon) => (
                                                <div key={addon.id} className="flex items-center justify-between text-sm">
                                                    <span className="flex items-center gap-2">
                                                        <Plus className="w-3 h-3 text-green-600" />
                                                        {addon.name}
                                                    </span>
                                                    <span className="font-medium">+{formatPrice(addon.price)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </ScrollArea>

                <DialogFooter className="px-6 py-4 border-t bg-muted/30">
                    <div className="flex items-center justify-between w-full">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Price</p>
                            <p className="text-3xl font-bold text-red-600">{formatPrice(totalPrice)}</p>
                            {selectedAddons.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    Base: {formatPrice(basePrice)} + Add-ons: {formatPrice(addonsTotal)}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleProceed}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Proceed to Checkout
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
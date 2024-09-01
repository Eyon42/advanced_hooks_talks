import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { useToast } from "~/hooks/use-toast";
import { getKitty, type Kitty, saveKitty } from "~/mock/api";

export default function SimpleExample() {
  const {
    query: { kittyId },
  } = useRouter();

  const [loadingInitialData, setLoadingInitialData] = useState(false);
  const [errorInitialData, setErrorInitialData] = useState("");
  const [formData, setFormData] = useState<Kitty>({
    name: "",
    size: "",
    age: "",
    vaccine: false,
  });
  useEffect(() => {
    setLoadingInitialData(true);
    void getKitty(kittyId as string)
      .then((kitty) => {
        if (kitty) {
          setFormData(kitty);
          setErrorInitialData("");
        }
      })
      .catch((e: Error) => {
        setErrorInitialData(e.message);
      })
      .finally(() => {
        setLoadingInitialData(false);
      });
  }, [kittyId]);

  const [savingForm, setSavingForm] = useState(false);
  const [savingFormError, setSavingFormError] = useState("");
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationCodeError, setVerificationCodeError] = useState("");
  const { toast } = useToast();

  async function onSubmit() {
    try {
      parseFloat(formData.age);
    } catch {
      setSavingFormError("Edad inválida");
      return;
    }
    if (!formData.name) {
      setSavingFormError("Nombre requerido");
      return;
    }
    if (!formData.size) {
      setSavingFormError("Tamaño requerido");
      return;
    }
    setSavingFormError("");
    setVerifyOpen(true);
  }

  async function saveForm() {
    setSavingForm(true);
    try {
      await saveKitty(kittyId as string, formData, verificationCode);
      toast({
        title: "Exito!",
        description: "Gatito guardado exitosamente",
      });
      setVerifyOpen(false);
      setSavingFormError("");
      setVerificationCodeError("");
    } catch (e) {
      const error = (e as Error).message;
      if (error == "Incorrect code") {
        setVerificationCodeError(error);
        return;
      }
      setSavingFormError(error);
      toast({
        title: "Error",
        variant: "destructive",
        description: error,
      });
    } finally {
      setSavingForm(false);
    }
  }

  return (
    <>
      <Head>
        <title>Applicación simple</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-start">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-[3rem]">
            Ejemplo simple
          </h1>
          {errorInitialData ? (
            <span className="text-red-500">{errorInitialData}</span>
          ) : (
            <></>
          )}
          {loadingInitialData ? (
            <Skeleton className="h-[500px] min-w-96 rounded-xl" />
          ) : (
            <Card className="px-8 py-6 md:min-w-96">
              <h2 className="mb-4 w-full text-2xl font-bold tracking-tight sm:text-[2rem]">
                Michi
              </h2>
              <div className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((d) => ({ ...d, name: e.target.value }))
                    }
                  ></Input>
                </div>
                <div>
                  <Label>Tamaño</Label>
                  <Select
                    value={formData.size}
                    onValueChange={(v) =>
                      setFormData((d) => ({ ...d, size: v }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Enorme</SelectItem>
                      <SelectItem value="dark">Normal</SelectItem>
                      <SelectItem value="system">Chiquito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="age">Edad</Label>

                  <Input
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData((d) => ({ ...d, age: e.target.value }))
                    }
                  ></Input>
                </div>
                <div className="flex gap-2 py-2">
                  <Checkbox
                    name="vaccine"
                    checked={formData.vaccine}
                    onCheckedChange={(c) =>
                      setFormData((d) => ({ ...d, vaccine: !!c }))
                    }
                  />
                  <Label htmlFor="vaccine">Vacunado</Label>
                </div>
              </div>
              <div className="flex w-full flex-col items-center gap-2 pt-4">
                <Button
                  className="w-full"
                  onClick={onSubmit}
                  loading={savingForm}
                >
                  Guardar
                </Button>
                {savingFormError ? (
                  <span className="text-red-500">{savingFormError}</span>
                ) : (
                  <></>
                )}
              </div>
              <Dialog
                open={verifyOpen}
                onOpenChange={(open) => {
                  setVerifyOpen(open);
                  setVerificationCodeError("");
                }}
              >
                <DialogContent className="w-96">
                  <DialogHeader>
                    <DialogTitle>Código de verificación</DialogTitle>
                    <DialogDescription>
                      Esta acción requiere un paso extra de autenticación.
                      Revisa tu telefono para obtener el código correspondiente
                    </DialogDescription>
                  </DialogHeader>
                  <Label htmlFor="code">Código</Label>
                  <Input
                    name="code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className={verificationCodeError ? "border-red-500" : ""}
                  ></Input>
                  <div className="flex w-full flex-col items-center gap-2 pt-4">
                    <Button
                      onClick={saveForm}
                      loading={savingForm}
                      className="w-full"
                    >
                      Verificar
                    </Button>
                    {verificationCodeError ? (
                      <span className="text-red-500">
                        {verificationCodeError}
                      </span>
                    ) : (
                      <></>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}

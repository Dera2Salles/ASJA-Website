import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MdCancel, MdLock, MdPerson2, MdPhone } from 'react-icons/md';

import { useAdminDashboardContext } from '../bloc/useAdminContext';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { classes, mentions } from '@/core/types';
import { useModalContext } from '../bloc/useModalContext';
import { AvatarUploader } from './avatar-uploader';

export const CardInputUser = () => {
    const {
        setMention,
        setLevel,
        level,
        setBranche,
        mention,
        setName,
        branche,
        setLastName,
        setPassword,
        setContact,
        sendStudentInformation,
        handleImageChange,
        image,
        isPremierPaid,
        isDeuxiemePaid,
        isTroisiemePaid,
        setIsPremierPaid,
        setIsDeuxiemePaid,
        setIsTroisiemePaid,
        name,
        lastName,
        contact,
        password,
    } = useAdminDashboardContext();

    const { closeAddUser } = useModalContext();

    return (
        <div className="flex w-1/2 flex-col gap-5">
            <Card className="border-t-4 border-t-green-600 p-5 transition-all duration-500">
                <CardContent>
                    <MdCancel
                        onClick={() => {
                            closeAddUser();
                        }}
                        className="absolute cursor-pointer text-4xl text-green-600 transition-all duration-300 hover:scale-125 dark:text-white"
                    />
                    <p className="flex w-full justify-center pb-10 text-3xl font-semibold text-gray-500">
                        Ajouter un etudiant
                    </p>
                    <AvatarUploader
                        image={image as string}
                        onCallBack={handleImageChange}
                    />
                    <form>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <div className="flex gap-3">
                                    <div className="flex w-1/2 flex-col">
                                        <Label
                                            htmlFor="name"
                                            className="text-lg font-semibold text-green-700"
                                        >
                                            Nom
                                        </Label>
                                        <div className="relative w-full">
                                            <MdPerson2 className="absolute top-1/2 left-3 -translate-y-1/2 text-xl text-gray-400" />
                                            <Input
                                                placeholder="Nom"
                                                className="bg-gray-200 pr-3 pl-10"
                                                onChange={(e) =>
                                                    setName(e.target.value)
                                                }
                                                value={name.toLocaleUpperCase()}
                                            />
                                        </div>
                                    </div>{' '}
                                    <div className="flex w-1/2 flex-col">
                                        {' '}
                                        <Label
                                            htmlFor="name"
                                            className="text-lg font-semibold text-green-700"
                                        >
                                            Prénom
                                        </Label>
                                        <div className="relative w-full">
                                            <MdPerson2 className="absolute top-1/2 left-3 -translate-y-1/2 text-xl text-gray-400" />
                                            <Input
                                                className="bg-gray-200 pr-3 pl-10"
                                                onChange={(e) =>
                                                    setLastName(e.target.value)
                                                }
                                                placeholder="Prénom"
                                                value={lastName}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Label
                                    htmlFor="name"
                                    className="text-lg font-semibold text-green-700"
                                >
                                    Contact
                                </Label>
                                <div className="relative w-full">
                                    <MdPhone className="absolute top-1/2 left-3 -translate-y-1/2 text-xl text-gray-400" />
                                    <Input
                                        className="bg-gray-200 pr-3 pl-10"
                                        type="number"
                                        onChange={(e) =>
                                            setContact(e.target.value)
                                        }
                                        value={contact}
                                    />
                                </div>

                                <Label
                                    htmlFor="name"
                                    className="text-lg font-semibold text-green-700"
                                >
                                    Mot de passe
                                </Label>
                                <div className="relative w-full">
                                    <MdLock className="absolute top-1/2 left-3 -translate-y-1/2 text-xl text-gray-400" />
                                    <Input
                                        value={password}
                                        className="bg-gray-200 pr-3 pl-10"
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col py-2.5">
                                <div className="flex gap-4">
                                    <Select
                                        value={mention}
                                        onValueChange={setMention}
                                    >
                                        <SelectTrigger className="w-full bg-gray-200">
                                            <SelectValue placeholder="Mention" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[900]">
                                            {Object.keys(mentions).map(
                                                (mainBranche) => (
                                                    <SelectItem
                                                        key={mainBranche}
                                                        value={mainBranche}
                                                    >
                                                        {mainBranche.replace(
                                                            /_/g,
                                                            '   ',
                                                        )}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        onValueChange={setLevel}
                                        value={level}
                                    >
                                        <SelectTrigger className="w-full bg-gray-200">
                                            <SelectValue placeholder="Niveau" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[900]">
                                            {classes.map((level) => (
                                                <SelectItem
                                                    key={level}
                                                    value={level}
                                                >
                                                    {level}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        onValueChange={setBranche}
                                        value={branche}
                                        disabled={
                                            !mention ||
                                            level == 'L1' ||
                                            level == 'L2'
                                        }
                                    >
                                        <SelectTrigger className="w-full bg-gray-100">
                                            <SelectValue placeholder="Branche" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[900]">
                                            {mention &&
                                                mentions[mention] &&
                                                mentions[mention][level] &&
                                                mentions[mention][level].map(
                                                    (branche) => (
                                                        <SelectItem
                                                            key={branche}
                                                            value={branche}
                                                        >
                                                            {branche}
                                                        </SelectItem>
                                                    ),
                                                )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </form>
                    <div className="flex w-full items-center justify-center gap-2 pt-5">
                        <Checkbox
                            checked={isPremierPaid}
                            onCheckedChange={() =>
                                setIsPremierPaid((value) => !value)
                            }
                            className="h-5 w-5 cursor-pointer"
                        />
                        <p className="font-semibold text-green-700 dark:text-white">
                            Tranche 1
                        </p>
                        <Checkbox
                            checked={isDeuxiemePaid}
                            onCheckedChange={() =>
                                setIsDeuxiemePaid((value) => !value)
                            }
                            className="h-5 w-5 cursor-pointer"
                        />
                        <p className="font-semibold text-green-700 dark:text-white">
                            Tranche 2
                        </p>
                        <Checkbox
                            checked={isTroisiemePaid}
                            onCheckedChange={() =>
                                setIsTroisiemePaid((value) => !value)
                            }
                            className="h-5 w-5 cursor-pointer"
                        />
                        <p className="font-semibold text-green-700 dark:text-white">
                            Tranche 3
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="p-0">
                    <Button
                        className="flex w-full cursor-pointer bg-green-700 p-6 hover:bg-green-900"
                        onClick={sendStudentInformation}
                    >
                        <p className="text-xl">Ajouter l'etudiant</p>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

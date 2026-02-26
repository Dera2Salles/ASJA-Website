import DepartmentForm from './DepartmentForm';

interface Department {
    id: number;
    slug: string;
    name: string;
    description: string;
    color: string;
    logo: string | null;
    hero_image: string | null;
    is_visible: boolean;
    sort_order: number;
    programs: any[];
}

export default function DepartmentEdit({ department }: { department: Department }) {
    return <DepartmentForm department={department} isEdit={true} />;
}

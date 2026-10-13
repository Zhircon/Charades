type concept = {
    es_description : string,
    en_description: string,
    image: string,
    level: number,
    category_id: number
}

type categories = {
    id: number,
    es_name : string,
    en_name: string,
    en_description: string,
    es_description: string
}
type settings ={
    languaje: "es " | "en" | string,
    category_selected: string,
    endless_active: boolean,
    minutes_per_round: number | null,
    cancepts: concept[];
}
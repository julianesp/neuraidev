//app\addProduct\page.jsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import guide from '../../../public/images/list_images.png';

export default function AddProduct() {
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !image) {
            alert('Name and image are required.');
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/api/products', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({ name, image, price, category }),
            });

            if (res.ok) {
                router.push('/products');
            } else {
                throw new Error('Failed to create a Product');
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <div className="flex flex-col justify-center items-center">
                <div className="flex justify-between items-center">
                    {/* <Button color="primary">Añadir nuevo prodcuto</Button> */}
                    <h1 className="mt-9 font-bold py-10 text-2xl ">
                        Añadir nuevo producto
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        className="input input-bordered input-accent w-full max-w-xs"
                        type="text"
                        placeholder="Product Name"
                    />

                    <input
                        onChange={(e) => setImage(e.target.value)}
                        value={image}
                        className="input input-bordered input-accent w-full max-w-xs"
                        type="text"
                        placeholder="/images/1.jpg"
                        defaultValue="/images/1.jpg"
                    />
                    <input
                        onChange={(e) => setPrice(e.target.value)}
                        value={price}
                        className="input input-bordered input-accent w-full max-w-xs"
                        type="number"
                        placeholder="$1.000"
                        defaultValue="1"
                    />
                    <input
                        onChange={(e) => setCategory(e.target.value)}
                        value={category}
                        className="input input-bordered input-accent w-full max-w-xs"
                        type="text"
                        placeholder="Product Category"
                    />

                    <button
                        type="submit"
                        className="btn btn-primary w-full max-w-xs"
                    >
                        Agregar accesorio
                    </button>
                    <Link href="/products">
                        <h1 className="mt-9 btn btn-primary w-full max-w-xs">
                            Mostrar accesorios
                        </h1>
                    </Link>
                </form>

                <div className="mt-6">
                    <Image src={guide} alt="Imagen guía" />
                </div>
            </div>
        </>
    );
}

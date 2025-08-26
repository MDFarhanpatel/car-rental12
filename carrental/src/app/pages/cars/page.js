import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { visible } from 'primereact/button';
export default function cars(){
  return (

    <>
    
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200">
      <div className="bg-white/90 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full max-w-md flex flex-col gap-8 border-2 border-blue-300">
        <h2 className="text-4xl font-extrabold text-black mb-2 text-center">
          User Management
        </h2>
        <p className="text-black text-sm text-center">Manage your users here!</p>
      </div>
    </div>

    <div className="card flex justify-content-center">
    <Sidebar visible={visible} onHide={() => setVisible(false)}>
        <h2>Sidebar</h2>
        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
    </Sidebar>
    <Button icon="pi pi-arrow-right" onClick={() => setVisible(true)} />
</div>
    
    </>
  );
}

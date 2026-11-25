<?php
namespace App\Services;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
class StudioContent {
 const COLLECTIONS=['projects','testimonials','packages','services','faqs','clients','benefits'];
 const SERVICES=['Logo design','Brand strategy','UI/UX design','Web development','Mobile app development','Custom web applications','CMS & platform development','API integrations','Maintenance & support','Motion & animation','Digital marketing','The full experience'];
 public function read(bool $public=false): array {
 $row=DB::table('studio_sites')->first(); abort_unless($row,503,'Run php artisan pixode:import first.');
 $data=json_decode($row->content,true); $data['revision']=(int)$row->revision; $data['updatedAt']=$row->updated_at;
 if($public) { unset($data['clients']); foreach(self::COLLECTIONS as $key) if($key !== 'clients') $data[$key]=array_values(array_filter($data[$key] ?? [],fn($i)=>($i['published'] ?? false) === true)); }
 return $data;
 }
 public function image(string $v): string { abort_unless($v === '' || preg_match('~^/(assets|uploads)/[a-zA-Z0-9_.-]+$~',$v) || (filter_var($v,FILTER_VALIDATE_URL) && parse_url($v,PHP_URL_SCHEME)==='https'),422,'Use a local image or HTTPS URL.'); return $v; }
 public function validate(string $collection,array $item): array {
 abort_unless(in_array($collection,self::COLLECTIONS),404,'Unknown collection.');
 $text='nullable|string|max:5000'; $required='required|string|max:150';
 $rules=match($collection) {
 'projects'=>['title'=>$required,'description'=>'required|string|max:5000','category'=>'required|in:digital,brand,logo,banner','tags'=>$text,'image'=>'nullable|string|max:2000','year'=>'nullable|string|max:50','template'=>'nullable|string|max:50'],
 'testimonials'=>['name'=>$required,'role'=>'nullable|string|max:200','quote'=>'required|string|max:3000','rating'=>'required|integer|min:1|max:5','avatar'=>'nullable|string|max:2000'],
 'packages'=>['title'=>$required,'description'=>'required|string|max:1000','category'=>'required|in:brand,web,commerce,motion,marketing','service'=>'required|in:'.implode(',',self::SERVICES),'price'=>'required|numeric|min:0|max:10000000','featured'=>'boolean','features'=>'required|array|min:1|max:30','features.*'=>'required|string|max:300'],
 'services'=>['title'=>$required,'description'=>'required|string|max:2000','icon'=>'nullable|string|max:30','tags'=>'nullable|string|max:1000','service'=>'required|in:'.implode(',',self::SERVICES)],
 'benefits'=>['title'=>$required,'description'=>'required|string|max:2000','icon'=>'nullable|string|max:30','tags'=>'nullable|string|max:1000'],
 'faqs'=>['question'=>'required|string|max:300','answer'=>'required|string|max:3000'],
 'clients'=>['name'=>$required,'email'=>'nullable|email|max:254','company'=>'nullable|string|max:150','notes'=>$text],
 };
 $rules['id']='nullable|string|regex:/^[a-zA-Z0-9_-]{1,80}$/'; if($collection !== 'clients') $rules['published']='boolean';
 $valid=Validator::make($item,$rules)->validate(); $valid['id']=$valid['id'] ?? (string)Str::uuid();
 if($collection !== 'clients') $valid['published']=$valid['published'] ?? true;
 foreach(['image','avatar'] as $key) if(isset($valid[$key])) $valid[$key]=$this->image($valid[$key]);
 return $valid;
 }
 public function mutate(int $revision,callable $change): array {
 return DB::transaction(function() use($revision,$change) { $row=DB::table('studio_sites')->lockForUpdate()->first(); abort_unless($row,503,'Import content first.'); abort_unless((int)$row->revision === $revision,409,'Someone updated this content. Refresh and try again.');
 $data=$change(json_decode($row->content,true)); $updated=DB::table('studio_sites')->where('id',$row->id)->where('revision',$revision)->update(['content'=>json_encode($data),'revision'=>$revision+1,'updated_at'=>now()]); abort_unless($updated,409,'Content changed. Refresh and try again.'); return $this->read(); });
 }
}

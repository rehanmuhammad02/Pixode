<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
class StudioAccess {
 public function handle(Request $r, Closure $next, string $role='studio') {
 $u=$r->user(); abort_unless($u,401,'Please sign in.');
 abort_unless($r->session()->get('studio_stamp') === $u->security_stamp,401,'Please sign in again.');
 abort_unless($u->verification_exempt || $u->email_verified_at,403,'Verify your email first.');
 if($role === 'owner') abort_unless($u->role === 'owner',403,'Owner access required.');
 if($role === 'studio') abort_unless(in_array($u->role,['owner','editor']),403,'Studio access required.');
 return $next($r);
 }
}

<?php
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
return Application::configure(basePath: dirname(__DIR__))
 ->withRouting(web: __DIR__.'/../routes/web.php',commands: __DIR__.'/../routes/console.php',health:'/up')
 ->withMiddleware(function(Middleware $m): void { $m->alias(['studio'=>App\Http\Middleware\StudioAccess::class]); $m->redirectGuestsTo('/login'); })
 ->withExceptions(function(Exceptions $e): void { $e->shouldRenderJsonWhen(fn(Request $r,Throwable $t)=>$r->is('api/*') || $r->expectsJson()); })->create();

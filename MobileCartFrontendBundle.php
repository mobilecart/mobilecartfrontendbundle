<?php

namespace MobileCart\FrontendBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;

class MobileCartFrontendBundle extends Bundle
{

    public function boot()
    {
        $this->container->get('cart.theme.config')
            ->setTheme(
                'frontend',
                'MobileCartFrontendBundle::frontend-layout.html.twig',
                'MobileCartFrontendBundle:',
                'bundles/mobilecartfrontend'
            )->setTheme(
                'email',
                'MobileCartFrontendBundle::email-layout.html.twig',
                'MobileCartFrontendBundle:',
                'bundles/mobilecartfrontend'
            );
    }

}
